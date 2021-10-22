import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { forEachInEnum, sortCards } from '@shared/Utils'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import ServerBuff from '@src/game/models/buffs/ServerBuff'
import { EventHook } from '@src/game/models/events/EventHook'
import { EventSubscription } from '@src/game/models/events/EventSubscription'
import { GameEvent, SharedEventArgs } from '@src/game/models/events/GameEventCreators'
import GameHookType, {
	CardDestroyedHookEditableValues,
	CardDestroyedHookFixedValues,
	CardPlayedHookEditableValues,
	CardPlayedHookFixedValues,
	CardTakesDamageHookEditableValues,
	CardTakesDamageHookFixedValues,
	GameFinishedHookEditableValues,
	GameFinishedHookFixedValues,
	RoundFinishedHookEditableValues,
	RoundFinishedHookFixedValues,
	SharedHookFixedValues,
	UnitDestroyedHookEditableValues,
	UnitDestroyedHookFixedValues,
} from '@src/game/models/events/GameHookType'
import { CardSelector } from '@src/game/models/events/selectors/CardSelector'
import { CardSelectorBuilder } from '@src/game/models/events/selectors/CardSelectorBuilder'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import { cardPerform, cardRequire } from '@src/game/utils/CardEventHandlers'
import { colorizeClass, colorizeId, getOwnerGroup, getOwnerPlayer } from '@src/utils/Utils'

export type EventSubscriber = ServerCard | ServerBuff | null

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
	public readonly eventLog: EventLogEntryMessage[][]
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
		forEachInEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		forEachInEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
	}

	public createCallback<EventArgs extends SharedEventArgs>(
		subscriber: EventSubscriber,
		event: GameEventType
	): EventSubscription<EventArgs> {
		const eventSubscription = new EventSubscription<EventArgs>(subscriber)
		this.eventSubscriptions.get(event)!.push(eventSubscription)
		return eventSubscription
	}

	public createHook<HookValues, HookArgs>(subscriber: EventSubscriber, hook: GameHookType): EventHook<HookValues, HookArgs> {
		const eventHook = new EventHook<HookValues, HookArgs>(subscriber)
		if (hook === GameHookType.CARD_TAKES_DAMAGE) {
			eventHook.require((args) => {
				const typedArgs = (args as unknown) as CardTakesDamageHookFixedValues
				return !typedArgs.damageInstance.redirectHistory.some((entry) => entry === eventHook.subscriber)
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
		forEachInEnum(GameEventType, (eventType) => {
			const subscriptions = this.eventSubscriptions.get(eventType)!
			const filteredSubscriptions = subscriptions.filter((subscription) => subscription.subscriber !== targetSubscriber)
			this.eventSubscriptions.set(eventType, filteredSubscriptions)
		})
		forEachInEnum(GameHookType, (hookType) => {
			const subscriptions = this.eventHooks.get(hookType)!
			const filteredSubscriptions = subscriptions.filter((subscription) => subscription.subscriber !== targetSubscriber)
			this.eventHooks.set(hookType, filteredSubscriptions)
		})
	}

	public postEvent(event: GameEvent, limitedTo: EventSubscriber[] | null = null): void {
		if (!event.hiddenFromLogs) {
			this.createEventLogEntry(event.type, event.logSubtype, event.logVariables)
		}

		const validSubscriptions = this.eventSubscriptions
			.get(event.type)!
			.filter((subscription) => limitedTo === null || limitedTo.includes(subscription.subscriber))
			.filter((subscription) => subscription.ignoreControlEffects || !ServerGameEvents.subscriberSuspended(subscription.subscriber))
			.filter((subscription) =>
				subscription.conditions.every((condition) => cardRequire(this.game, subscription.subscriber, () => condition(event.args, event)))
			)
			.filter((subscription) =>
				subscription.immediateConditions.every((condition) =>
					cardRequire(this.game, subscription.subscriber, () => condition(event.args, event, event))
				)
			)

		validSubscriptions.forEach((subscription) => {
			const preparedState = subscription.prepares.reduce((state, preparator) => preparator(event.args, state), {})

			if (
				this.evaluatingSelectors ||
				event.type === GameEventType.GAME_CREATED ||
				event.type === GameEventType.GAME_SETUP ||
				event.type === GameEventType.POST_GAME_SETUP ||
				event.type === GameEventType.BEFORE_CARD_TAKES_DAMAGE ||
				(event.effectSource && event.effectSource === subscription.subscriber)
			) {
				subscription.callbacks.forEach((callback) => {
					this.logEventExecution(event, subscription, true)
					cardPerform(this.game, subscription.subscriber, () => {
						callback(event.args, preparedState)
					})
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

	public applyHooks(
		hook: GameHookType.CARD_PLAYED,
		editableValues: CardPlayedHookEditableValues,
		fixedValues: CardPlayedHookFixedValues
	): CardPlayedHookEditableValues
	public applyHooks(
		hook: GameHookType.CARD_TAKES_DAMAGE,
		editableValues: CardTakesDamageHookEditableValues,
		fixedValues: CardTakesDamageHookFixedValues
	): CardTakesDamageHookEditableValues
	public applyHooks(
		hook: GameHookType.CARD_DESTROYED,
		editableValues: CardDestroyedHookEditableValues,
		fixedValues: CardDestroyedHookFixedValues
	): CardDestroyedHookEditableValues
	public applyHooks(
		hook: GameHookType.UNIT_DESTROYED,
		editableValues: UnitDestroyedHookEditableValues,
		fixedValues: UnitDestroyedHookFixedValues
	): UnitDestroyedHookEditableValues
	public applyHooks(
		hook: GameHookType.ROUND_FINISHED,
		editableValues: RoundFinishedHookEditableValues,
		fixedValues: RoundFinishedHookFixedValues
	): RoundFinishedHookEditableValues
	public applyHooks(
		hook: GameHookType.GAME_FINISHED,
		editableValues: GameFinishedHookEditableValues,
		fixedValues: GameFinishedHookFixedValues
	): GameFinishedHookEditableValues
	public applyHooks<EditableValues, FixedValues extends SharedHookFixedValues>(
		hook: GameHookType,
		editableValues: EditableValues,
		fixedValues: FixedValues
	): EditableValues {
		const unsortedHooks = this.eventHooks
			.get(hook)!
			.filter((hook) => hook.ignoreControlEffects || !ServerGameEvents.subscriberSuspended(hook.subscriber))

		const sortedHooks = unsortedHooks.sort((a, b) => this.eventCallbackSorter(this.game, a, b))

		return sortedHooks.reduce((currentHookEditables, subscription) => {
			const conditionMatches = subscription.conditions.every((condition) =>
				cardRequire(this.game, subscription.subscriber, () => condition(fixedValues, { ...currentHookEditables }))
			)

			if (!conditionMatches) {
				return currentHookEditables
			}

			this.logHookExecution(hook, subscription)
			subscription.callbacks.forEach((callback) => {
				cardPerform(this.game, subscription.subscriber, () => callback(fixedValues, { ...currentHookEditables }))
			})

			return subscription.hooks.reduce((innerHookEditables, hookReplaceFunc) => {
				return hookReplaceFunc(innerHookEditables, fixedValues)
			}, currentHookEditables)
		}, editableValues)
	}

	public resolveEvents(): void {
		let currentCallbacks = this.callbackQueue.slice().sort((a, b) => this.eventCallbackSorter(this.game, a, b))

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
				if (this.game.cardPlay.getResolvingCardTargets().length === 0) {
					this.game.cardPlay.cardResolveStack.resumeResolving()
				} else {
					this.game.cardPlay.updateResolvingCardTargetingStatus()
					break
				}
			}
		}
		resolveCards()

		const filterOutEvents = () => {
			currentCallbacks = currentCallbacks.filter((callbackWrapper) =>
				callbackWrapper.immediateConditions.every((condition) =>
					cardRequire(this.game, callbackWrapper.subscriber, () =>
						condition(callbackWrapper.args, callbackWrapper.preparedState, callbackWrapper.rawEvent)
					)
				)
			)
		}
		filterOutEvents()

		this.callbackQueue = []
		while (currentCallbacks.length > 0) {
			const callbackWrapper = currentCallbacks.shift()!

			this.logEventExecution(callbackWrapper.rawEvent, callbackWrapper.subscription, false)
			cardPerform(this.game, callbackWrapper.subscriber, () => {
				callbackWrapper.callback(callbackWrapper.args, callbackWrapper.preparedState)
			})
			this.game.animation.syncAnimationThreads()

			filterOutEvents()
			resolveCards()
		}

		/* New events have been added; perform those as well */
		if (this.callbackQueue.length > 0) {
			this.resolveEvents()
		}
	}

	private eventCallbackSorter(game: ServerGame, a: { subscriber: EventSubscriber }, b: { subscriber: EventSubscriber }): number {
		// Player > System
		if (a.subscriber === null && b.subscriber !== null) {
			return 1
		} else if (b.subscriber === null && a.subscriber !== null) {
			return -1
		} else if (a.subscriber === null || b.subscriber === null) {
			return 0
		}

		// Current player > Opponent
		const ownerOfA = getOwnerGroup(a.subscriber)
		const ownerOfB = getOwnerGroup(b.subscriber)
		if (ownerOfA !== ownerOfB) {
			if (ownerOfA === game.activePlayer) {
				return -1
			} else if (ownerOfB === game.activePlayer) {
				return 1
			}
		}

		// Card effects > Row effects
		if (a.subscriber instanceof ServerCard && b.subscriber instanceof ServerBuff && b.subscriber.parent instanceof ServerBoardRow) {
			return -1
		} else if (b.subscriber instanceof ServerCard && a.subscriber instanceof ServerBuff && a.subscriber.parent instanceof ServerBoardRow) {
			return 1
		} else if (
			a.subscriber instanceof ServerBuff &&
			b.subscriber instanceof ServerBuff &&
			a.subscriber.parent instanceof ServerBoardRow &&
			b.subscriber.parent instanceof ServerBoardRow
		) {
			const distanceOfA = game.board.getDistanceToStaticFront(a.subscriber.parent.index)
			const distanceOfB = game.board.getDistanceToStaticFront(b.subscriber.parent.index)
			return distanceOfA - distanceOfB
		}

		// Board > Hand > Deck > Graveyard > Other locations
		const cardOfA = a.subscriber instanceof ServerCard ? a.subscriber : (a.subscriber.parent as ServerCard)
		const cardOfB = b.subscriber instanceof ServerCard ? b.subscriber : (b.subscriber.parent as ServerCard)
		const locationToNumber = (cardLocation: CardLocation): number => {
			switch (cardLocation) {
				case CardLocation.BOARD:
					return 0
				case CardLocation.HAND:
					return 1
				case CardLocation.DECK:
					return 2
				case CardLocation.GRAVEYARD:
					return 3
				default:
					return 100
			}
		}
		const locationOfA = cardOfA.location
		const locationOfB = cardOfB.location
		const numericLocationOfA = locationToNumber(locationOfA)
		const numericLocationOfB = locationToNumber(locationOfB)
		if (numericLocationOfA !== numericLocationOfB) {
			return numericLocationOfA - numericLocationOfB
		}

		// Card on the left > Card on the right
		const getCardIndex = (card: ServerCard, owner: ServerPlayerInGame, location: CardLocation): number => {
			switch (location) {
				case CardLocation.HAND:
					return sortCards(owner.cardHand.allCards).indexOf(card)
				case CardLocation.DECK:
					return owner.cardDeck.allCards.indexOf(card)
				case CardLocation.GRAVEYARD:
					return owner.cardGraveyard.allCards.indexOf(card)
				default:
					return 100
			}
		}

		const playerOwnerOfA = getOwnerPlayer(a.subscriber)
		const playerOwnerOfB = getOwnerPlayer(b.subscriber)
		if (
			locationOfA === locationOfB &&
			locationOfA !== CardLocation.BOARD &&
			locationOfB !== CardLocation.BOARD &&
			playerOwnerOfA &&
			playerOwnerOfB
		) {
			const indexOfA = getCardIndex(cardOfA, playerOwnerOfA, locationOfA)
			const indexOfB = getCardIndex(cardOfB, playerOwnerOfB, locationOfB)
			return indexOfA - indexOfB
		}

		const unitOfA = cardOfA.unit
		const unitOfB = cardOfB.unit
		if (unitOfA && unitOfB) {
			const rowIndexOfA = unitOfA.rowIndex
			const rowIndexOfB = unitOfB.rowIndex
			// Unit at the front > Unit at the back
			if (rowIndexOfA !== rowIndexOfB) {
				const distanceOfA = game.board.getDistanceToStaticFront(rowIndexOfA)
				const distanceOfB = game.board.getDistanceToStaticFront(rowIndexOfB)
				return distanceOfA - distanceOfB
			}

			// Unit on the left > Unit on the right
			return unitOfA.unitIndex - unitOfB.unitIndex
		}

		return 0
	}

	private logEventExecution(event: GameEvent, subscription: EventSubscription<any>, isImmediate: boolean): void {
		const subscriber = subscription.subscriber
		const subscriberId = !subscriber ? this.game.id : `${subscriber.id}`

		const expandedSubscriberId =
			subscription.subscriber instanceof ServerBuff
				? `${colorizeId(subscriberId)} on ${colorizeId(subscription.subscriber.parent.id)}`
				: colorizeId(subscriberId)

		const gameId = colorizeId(this.game.id)
		const eventType = colorizeClass(event.type)
		const eventTiming = isImmediate ? 'effect' : 'callback'

		console.info(`[${gameId}] ${eventType} ${eventTiming} for ${expandedSubscriberId}`)
	}

	// TODO: Promote hooks to first-class citizens
	private logHookExecution(hook: GameHookType, subscription: EventHook<any, any>): void {
		const subscriber = subscription.subscriber
		const subscriberId = !subscriber ? this.game.id : `${subscriber.id}`

		const expandedSubscriberId =
			subscription.subscriber instanceof ServerBuff
				? `${colorizeId(subscriberId)} on ${colorizeId(subscription.subscriber.parent.id)}`
				: colorizeId(subscriberId)

		const gameId = colorizeId(this.game.id)
		const eventType = colorizeClass(hook)

		console.info(`[${gameId}] ${eventType} hook for ${expandedSubscriberId}`)
	}

	public evaluateSelectors(): void {
		this.evaluatingSelectors = true
		this.cardSelectors = this.cardSelectors.concat(this.cardSelectorBuilders.map((builder) => builder._build(this.game)))
		this.cardSelectorBuilders = []

		let allGameCards: ServerCard[] = this.game.board
			.getAllUnits()
			.map((unit) => unit.card)
			.concat(this.game.cardPlay.cardResolveStack.entries.map((entry) => entry.ownedCard.card))
		this.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((player) => {
				allGameCards = allGameCards.concat([player.leader])
				allGameCards = allGameCards.concat(player.cardHand.allCards)
				allGameCards = allGameCards.concat(player.cardDeck.allCards)
				allGameCards = allGameCards.concat(player.cardGraveyard.allCards)
			})
		allGameCards = new Array(...new Set(allGameCards))

		// TODO: Sort selectors!
		this.cardSelectors.forEach((selector) => {
			if ((!selector.ignoreControlEffects && ServerGameEvents.subscriberSuspended(selector.subscriber)) || selector.markedForRemoval) {
				selector.clearSelection()
			} else {
				selector.evaluate(allGameCards)
			}
		})

		this.cardSelectors = this.cardSelectors.filter((selector) => !selector.markedForRemoval)

		this.evaluatingSelectors = false
	}

	private static subscriberSuspended(subscriber: EventSubscriber): boolean {
		if (!subscriber) {
			return false
		}
		if (subscriber instanceof ServerBuff && subscriber.parent instanceof ServerCard) {
			return subscriber.parent.features.includes(CardFeature.SUSPENDED)
		} else if (subscriber instanceof ServerBuff) {
			return false
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
			args: args || {},
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
