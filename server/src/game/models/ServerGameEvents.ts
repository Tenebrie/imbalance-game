import ServerGame from './ServerGame'
import Utils from '../../utils/Utils'
import ServerCard from './ServerCard'
import CardLocation from '@shared/enums/CardLocation'
import {cardPerform, cardRequire} from '../utils/CardEventHandlers'
import ServerBuff from './ServerBuff'
import GameHookType from './events/GameHookType'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameEventType from '@shared/enums/GameEventType'
import {GameEvent} from './events/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import {EventCallback} from './events/EventCallback'
import {EventHook} from './events/EventHook'
import {CardSelector, CardSelectorBuilder} from './events/CardSelector'

export type EventSubscriber = ServerGame | ServerCard | ServerBuff

export default class ServerGameEvents {
	private readonly game: ServerGame
	private readonly eventLog: EventLogEntryMessage[][]
	private eventCallbacks: Map<GameEventType, EventCallback<any>[]>
	private eventHooks: Map<GameHookType, EventHook<any, any>[]>
	private cardSelectors: CardSelector[]
	private cardSelectorBuilders: CardSelectorBuilder[]

	constructor(game: ServerGame) {
		this.game = game
		this.eventCallbacks = new Map<GameEventType, EventCallback<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
		this.cardSelectors = []
		this.cardSelectorBuilders = []
		this.eventLog = []
		this.eventLog.push([])
		Utils.forEachInStringEnum(GameEventType, eventType => this.eventCallbacks.set(eventType, []))
		Utils.forEachInStringEnum(GameHookType, hookType => this.eventHooks.set(hookType, []))
	}

	public createCallback<EventArgs>(subscriber: EventSubscriber, event: GameEventType): EventCallback<EventArgs> {
		const eventCallback = new EventCallback<EventArgs>(subscriber)
		this.eventCallbacks.get(event)!.push(eventCallback)
		return eventCallback
	}

	public createHook<HookValues, HookArgs>(subscriber: EventSubscriber, hook: GameHookType): EventHook<HookValues, HookArgs> {
		const eventHook = new EventHook<HookValues, HookArgs>(subscriber)
		this.eventHooks.get(hook)!.push(eventHook)
		return eventHook
	}

	public createSelector(subscriber: EventSubscriber): CardSelectorBuilder {
		const cardSelector = new CardSelectorBuilder(subscriber)
		this.cardSelectorBuilders.push(cardSelector)
		return cardSelector
	}

	public unsubscribe(targetSubscriber: EventSubscriber): void {
		Utils.forEachInStringEnum(GameEventType, eventType => {
			const subscriptions = this.eventCallbacks.get(eventType)!
			const filteredSubscriptions = subscriptions.filter(subscription => subscription.subscriber !== targetSubscriber)
			this.eventCallbacks.set(eventType, filteredSubscriptions)
		})
		Utils.forEachInStringEnum(GameHookType, hookType => {
			const subscriptions = this.eventHooks.get(hookType)!
			const filteredSubscriptions = subscriptions.filter(subscription => subscription.subscriber !== targetSubscriber)
			this.eventHooks.set(hookType, filteredSubscriptions)
		})
	}

	public postEvent(event: GameEvent, args: { allowThreading?: boolean } = { allowThreading: false }): void {
		this.createEventLogEntry(event.type, event.logSubtype, event.logVariables)

		const validCallbacks = this.eventCallbacks
			.get(event.type)!
			.filter(subscription => subscription.ignoreControlEffects || !this.subscriberSuspended(subscription.subscriber))
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(event.args, event))
			}))

		const preparedCallbacks = validCallbacks.map(callback => ({
			callback: callback,
			subscriber: callback.subscriber,
			preparedState: callback.prepares.reduce((state, preparator) => preparator(event.args, state), {}),
		}))

		preparedCallbacks
			.forEach(preparedCallback => {
				if (preparedCallback.callback.conditions.find((condition) => cardRequire(() => !condition(event.args, event)))) {
					return
				}

				const failedSubscribers: EventSubscriber[] = []
				preparedCallback.callback.callbacks.forEach(callback => {
					if (failedSubscribers.includes(preparedCallback.subscriber)) {
						return
					}

					if (args.allowThreading) {
						this.game.animation.createAnimationThread()
					}

					try {
						callback(event.args, preparedCallback.preparedState)
					} catch (err) {
						failedSubscribers.push(preparedCallback.subscriber)
					}

					if (args.allowThreading) {
						this.game.animation.commitAnimationThread()
					} else {
						this.game.animation.syncAnimationThreads()
					}
				})
			})
	}

	public applyHooks<HookValues, HookArgs>(hook: GameHookType, values: HookValues, args?: HookArgs): HookValues {
		const hookArgs = args ? args : values

		const matchingHooks = this.eventHooks.get(hook)!
			.filter(subscription => subscription.ignoreControlEffects || !this.subscriberSuspended(subscription.subscriber))
			.filter(hook => !hook.conditions.find(condition => {
				return cardRequire(() => !condition(hookArgs))
			}))

		matchingHooks.forEach(hook => hook.callbacks.forEach(callback => {
			cardPerform(() => callback(hookArgs))
		}))

		return matchingHooks
			.reduce((accOuter, subscription) => {
				return subscription.hooks.reduce((accInner, replace) => {
					return replace(accInner, hookArgs)
				}, accOuter)
			}, values)
	}

	public evaluateSelectors(): void {
		this.cardSelectors = this.cardSelectors.concat(this.cardSelectorBuilders.map(builder => builder.build()))
		this.cardSelectorBuilders = []

		let allGameCards: ServerCard[] = this.game.board.getAllUnits().map(unit => unit.card)
			.concat(this.game.cardPlay.cardResolveStack.entries.map(entry => entry.ownedCard.card))
		this.game.players.forEach(player => {
			allGameCards = allGameCards.concat(player.cardHand.allCards)
			allGameCards = allGameCards.concat(player.cardDeck.allCards)
			allGameCards = allGameCards.concat(player.cardGraveyard.allCards)
		})
		allGameCards = new Array(...new Set(allGameCards))

		this.cardSelectors.forEach(selector => {
			if (this.subscriberSuspended(selector.subscriber)) {
				selector.clearSelection()
			} else {
				selector.evaluate(allGameCards)
			}
		})
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
			args: args
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
