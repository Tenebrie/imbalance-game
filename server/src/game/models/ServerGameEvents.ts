import ServerGame from './ServerGame'
import Utils, { colorizeClass, colorizeId } from '../../utils/Utils'
import ServerCard from './ServerCard'
import { cardPerform, cardRequire } from '../utils/CardEventHandlers'
import ServerBuff from './ServerBuff'
import GameHookType, { CardTakesDamageHookArgs } from './events/GameHookType'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameEventType from '@shared/enums/GameEventType'
import { GameEvent } from './events/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import { EventSubscription } from './events/EventSubscription'
import { EventHook } from './events/EventHook'
import { CardSelector } from './events/selectors/CardSelector'
import { CardSelectorBuilder } from './events/selectors/CardSelectorBuilder'

export type EventSubscriber = ServerGame | ServerCard | ServerBuff

type CallbackQueueEntry = {
	subscription: EventSubscription<any>
	callback: (args: Record<string, any>, preparedState: Record<string, any>) => void
	args: Record<string, any>
	rawEvent: GameEvent
	subscriber: EventSubscriber
	preparedState: Record<string, any>
	immediateConditions: ((args: Record<string, any>, preparedState: Record<string, any>, rawEvent: GameEvent) => boolean)[]
}

export default class ServerGameEvents {
	private readonly game: ServerGame
	private readonly eventLog: EventLogEntryMessage[][]
	private eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	private eventHooks: Map<GameHookType, EventHook<any, any>[]>

	private evaluatingSelectors = false
	private callbackQueue: CallbackQueueEntry[]
	private cardSelectors: CardSelector[]
	private cardSelectorBuilders: CardSelectorBuilder[]

	constructor(game: ServerGame) {
		this.game = game
		this.eventSubscriptions = new Map<GameEventType, EventSubscription<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()

		this.callbackQueue = []
		this.cardSelectors = []
		this.cardSelectorBuilders = []

		this.eventLog = []
		this.eventLog.push([])
		Utils.forEachInStringEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		Utils.forEachInStringEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
	}

	public createCallback<EventArgs>(subscriber: EventSubscriber, event: GameEventType): EventSubscription<EventArgs> {
		const eventSubscription = new EventSubscription<EventArgs>(subscriber)
		this.eventSubscriptions.get(event)!.push(eventSubscription)
		return eventSubscription
	}

	public createHook<HookValues, HookArgs>(subscriber: EventSubscriber, hook: GameHookType): EventHook<HookValues, HookArgs> {
		const eventHook = new EventHook<HookValues, HookArgs>(subscriber)
		if (hook === GameHookType.CARD_TAKES_DAMAGE) {
			eventHook.require((args) => {
				const typedArgs = (args as unknown) as CardTakesDamageHookArgs
				return !typedArgs.damageInstance.redirectHistory.find((entry) => entry.proxyCard === eventHook.subscriber)
			})
		}
		this.eventHooks.get(hook)!.push(eventHook)
		return eventHook
	}

	public createSelector(subscriber: EventSubscriber): CardSelectorBuilder {
		const cardSelector = new CardSelectorBuilder(subscriber)
		this.cardSelectorBuilders.push(cardSelector)
		return cardSelector
	}

	public unsubscribe(targetSubscriber: EventSubscriber): void {
		this.cardSelectors.filter((selector) => selector.subscriber === targetSubscriber).forEach((selector) => selector.markForRemoval())
		Utils.forEachInStringEnum(GameEventType, (eventType) => {
			const subscriptions = this.eventSubscriptions.get(eventType)!
			const filteredSubscriptions = subscriptions.filter((subscription) => subscription.subscriber !== targetSubscriber)
			this.eventSubscriptions.set(eventType, filteredSubscriptions)
		})
		Utils.forEachInStringEnum(GameHookType, (hookType) => {
			const subscriptions = this.eventHooks.get(hookType)!
			const filteredSubscriptions = subscriptions.filter((subscription) => subscription.subscriber !== targetSubscriber)
			this.eventHooks.set(hookType, filteredSubscriptions)
		})
	}

	public postEvent(event: GameEvent): void {
		this.createEventLogEntry(event.type, event.logSubtype, event.logVariables)

		const validSubscriptions = this.eventSubscriptions
			.get(event.type)!
			.filter((subscription) => subscription.ignoreControlEffects || !this.subscriberSuspended(subscription.subscriber))
			.filter((subscription) =>
				subscription.conditions.every((condition) => {
					return cardRequire(() => condition(event.args, event))
				})
			)

		validSubscriptions.forEach((subscription) => {
			const preparedState = subscription.prepares.reduce((state, preparator) => preparator(event.args, state), {})

			if (this.evaluatingSelectors || (event.effectSource && event.effectSource === subscription.subscriber)) {
				subscription.callbacks.forEach((callback) => {
					this.logEventExecution(event, subscription, true)
					callback(event.args, preparedState)
				})
				return
			}

			this.callbackQueue = this.callbackQueue.concat(
				subscription.callbacks.map((callbackFunction) => ({
					callback: callbackFunction,
					args: event.args,
					rawEvent: event,
					subscriber: subscription.subscriber,
					preparedState: preparedState,
					immediateConditions: subscription.immediateConditions,
					subscription: subscription,
				}))
			)
		})
	}

	public applyHooks<HookValues, HookArgs>(hook: GameHookType, values: HookValues, args?: HookArgs): HookValues {
		const hookArgs = args ? args : values

		const matchingHooks = this.eventHooks
			.get(hook)!
			.filter((subscription) => subscription.ignoreControlEffects || !this.subscriberSuspended(subscription.subscriber))
			.filter(
				(hook) =>
					!hook.conditions.find((condition) => {
						return cardRequire(() => !condition(hookArgs))
					})
			)

		matchingHooks.forEach((hook) =>
			hook.callbacks.forEach((callback) => {
				cardPerform(() => callback(hookArgs))
			})
		)

		return matchingHooks.reduce((accOuter, subscription) => {
			return subscription.hooks.reduce((accInner, replace) => {
				return replace(accInner, hookArgs)
			}, accOuter)
		}, values)
	}

	public resolveEvents(): void {
		// TODO: Add sorting here
		// 1. Current player > Opponent > System
		// 2. Board > Hand > Deck > Graveyard
		// 3. Front row > Center row > Back row
		// 4. Unit on the left > Unit on the right
		let currentCallbacks = this.callbackQueue.slice().sort(() => 0)

		const resolveCards = () => {
			while (
				this.game.cardPlay.cardResolveStack.currentCard &&
				!currentCallbacks.find(
					(remainingCallback) => remainingCallback.subscriber === this.game.cardPlay.cardResolveStack.currentCard?.card
				) &&
				!this.callbackQueue.find(
					(remainingCallback) => remainingCallback.subscriber === this.game.cardPlay.cardResolveStack.currentCard?.card
				)
			) {
				if (this.game.cardPlay.getValidTargets().length === 0) {
					this.game.cardPlay.cardResolveStack.resumeResolving()
				} else {
					this.game.cardPlay.updateResolvingCardTargetingStatus()
					break
				}
			}
		}
		resolveCards()

		const filterOutEvents = () => {
			currentCallbacks = currentCallbacks.filter((callbackWrapper) => {
				const failedCondition = callbackWrapper.immediateConditions.find((condition) => {
					return cardRequire(() => !condition(callbackWrapper.args, callbackWrapper.preparedState, callbackWrapper.rawEvent))
				})
				return !failedCondition
			})
		}
		filterOutEvents()

		this.callbackQueue = []
		while (currentCallbacks.length > 0) {
			const callbackWrapper = currentCallbacks.shift()!

			this.logEventExecution(callbackWrapper.rawEvent, callbackWrapper.subscription, false)
			callbackWrapper.callback(callbackWrapper.args, callbackWrapper.preparedState)
			this.game.animation.syncAnimationThreads()

			filterOutEvents()
			resolveCards()
		}

		/* New events have been added; perform those as well */
		if (this.callbackQueue.length > 0) {
			this.resolveEvents()
		}
	}

	private logEventExecution(event: GameEvent, subscription: EventSubscription<any>, isImmediate: boolean): void {
		const subscriber = subscription.subscriber
		const subscriberId = subscriber instanceof ServerGame ? '' : `${subscriber.id}`
		const subscriberClass =
			subscriber instanceof ServerCard ? subscriber.class : subscriber instanceof ServerBuff ? subscriber.class : 'System'

		const gameId = colorizeId(this.game.id)
		const eventType = colorizeClass(event.type)
		const eventTiming = isImmediate ? 'effect' : 'callback'

		console.info(`[${gameId}] Executing ${eventTiming} on ${eventType} for ${colorizeClass(subscriberClass)}:${colorizeId(subscriberId)}`)
	}

	public evaluateSelectors(): void {
		this.evaluatingSelectors = true
		this.cardSelectors = this.cardSelectors.concat(this.cardSelectorBuilders.map((builder) => builder._build()))
		this.cardSelectorBuilders = []

		let allGameCards: ServerCard[] = this.game.board
			.getAllUnits()
			.map((unit) => unit.card)
			.concat(this.game.cardPlay.cardResolveStack.entries.map((entry) => entry.ownedCard.card))
		this.game.players.forEach((player) => {
			allGameCards = allGameCards.concat(player.cardHand.allCards)
			allGameCards = allGameCards.concat(player.cardDeck.allCards)
			allGameCards = allGameCards.concat(player.cardGraveyard.allCards)
		})
		allGameCards = new Array(...new Set(allGameCards))

		this.cardSelectors.forEach((selector) => {
			if ((!selector.ignoreControlEffects && this.subscriberSuspended(selector.subscriber)) || selector.markedForRemoval) {
				selector.clearSelection()
			} else {
				selector.evaluate(allGameCards)
			}
		})

		this.cardSelectors = this.cardSelectors.filter((selector) => !selector.markedForRemoval)

		this.evaluatingSelectors = false
	}

	private subscriberSuspended(subscriber: EventSubscriber): boolean {
		if (subscriber instanceof ServerGame) {
			return false
		}
		if (subscriber instanceof ServerBuff) {
			return subscriber.card.features.includes(CardFeature.SUSPENDED)
		}
		return subscriber.features.includes(CardFeature.STUNNED)
	}

	private get currentLogEventGroup(): EventLogEntryMessage[] {
		return this.eventLog[this.eventLog.length - 1]
	}

	private createEventLogEntry(eventType: GameEventType, subtype: string | undefined, args: Record<string, any> | undefined): void {
		this.currentLogEventGroup.push({
			event: eventType,
			subtype: subtype,
			timestamp: Number(new Date()),
			args: args,
		})
	}

	public flushLogEventGroup(): void {
		if (this.currentLogEventGroup.length === 0) {
			return
		}
		OutgoingMessageHandlers.sendLogMessageGroup(this.game, this.currentLogEventGroup)
		this.eventLog.push([])
	}
}
