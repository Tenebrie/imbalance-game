import ServerGame from './ServerGame'
import Utils from '../../utils/Utils'
import ServerCard from './ServerCard'
import CardLocation from '@shared/enums/CardLocation'
import {cardPerform, cardRequire} from '../utils/CardEventHandlers'
import ServerBuff from './ServerBuff'
import GameHookType from './GameHookType'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameEventType from '@shared/enums/GameEventType'
import {GameEvent} from './GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'

export type EventSubscriber = ServerGame | ServerCard | ServerBuff

export class EventCallback<EventArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __prepares: ((args: EventArgs, preparedState: Record<string, any>) => Record<string, any>)[]
	private readonly __callbacks: ((args: EventArgs, preparedState: Record<string, any>) => void)[]
	private readonly __conditions: ((args: EventArgs, rawEvent: GameEvent) => boolean)[]
	private __ignoreControlEffects: boolean

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__prepares = []
		this.__callbacks = []
		this.__conditions = []
		this.__ignoreControlEffects = false
	}

	public get subscriber(): EventSubscriber {
		return this.__subscriber
	}

	public get prepares(): ((args: EventArgs, preparedState: Record<string, any>) => Record<string, any>)[] {
		return this.__prepares
	}

	public get callbacks(): ((args: EventArgs, preparedState: Record<string, any>) => void)[] {
		return this.__callbacks
	}

	public get conditions(): ((args: EventArgs, rawEvent: GameEvent) => boolean)[] {
		return this.__conditions
	}

	public get ignoreControlEffects(): boolean {
		return this.__ignoreControlEffects
	}

	/* Prepare state to be used in the callback
	 * ----------------------------------------
	 * State is being prepared synchronously on every queued callback before any of them execute. As a result, this is useful
	 * to synchronize multiple copies of the same card and prevent effect race conditions.
	 */
	prepare(callback: (args: EventArgs, preparedState: Record<string, any>) => Record<string, any>): EventCallback<EventArgs> {
		this.__prepares.push(callback)
		return this
	}

	/* Perform a callback when an event occurs and all conditions are satisfied
	 * ------------------------------------------------------------------------
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 *
	 * If any of the `perform` expressions throws an error, the execution of the chain is stopped.
	 */
	perform(callback: (args: EventArgs, preparedState: Record<string, any>) => void): EventCallback<EventArgs> {
		this.__callbacks.push(callback)
		return this
	}

	/* Require a condition to be true before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The callback will only execute if all conditions return `true` or other truthy value.
	 */
	require(condition: (args: EventArgs, rawEvent: GameEvent) => boolean): EventCallback<EventArgs> {
		this.__conditions.push(condition)
		return this
	}

	/* Ignore control effects
	 * ------------------------------------------------------------------------
	 * This callback will ignore stun and suspension effects applied to card and fire even if the normal callbacks would be skipped.
	 */
	forceIgnoreControlEffects(): EventCallback<EventArgs> {
		this.__ignoreControlEffects = true
		return this
	}
}

export class EventHook<HookValues, HookArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __hooks: ((values: HookValues, args?: HookArgs) => HookValues)[]
	private readonly __callbacks: ((args: HookArgs) => void)[]
	private readonly __conditions: ((args: HookArgs) => boolean)[]
	private __ignoreControlEffects = false

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__hooks = []
		this.__callbacks = []
		this.__conditions = []
	}

	public get subscriber(): EventSubscriber {
		return this.__subscriber
	}

	public get hooks(): ((values: HookValues, args?: HookArgs) => HookValues)[] {
		return this.__hooks
	}

	public get callbacks(): ((args: HookArgs) => void)[] {
		return this.__callbacks
	}

	public get conditions(): ((args: HookArgs) => boolean)[] {
		return this.__conditions
	}

	public get ignoreControlEffects(): boolean {
		return this.__ignoreControlEffects
	}

	/* Add a hook values replace function
	 * ------------------------------------------------------------------------
	 * In the replace function parameters, `values` is replaceable values object, and `args` is optional extra hook
	 * parameters.
	 *
	 * Replace function must return a modified `values` object.
	 */
	replace(func: (values: HookValues, args?: HookArgs) => HookValues): EventHook<HookValues, HookArgs> {
		this.__hooks.push(func)
		return this
	}

	/* Perform a callback when a hook event occurs and all conditions are satisfied
	 * ------------------------------------------------------------------------
	 * The `args` argument provided to the callback is the original one, not affected by `replace` result.
	 */
	perform(callback: (args: HookArgs) => void): EventHook<HookValues, HookArgs> {
		this.__callbacks.push(callback)
		return this
	}

	/* Require a condition to be true before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The hook will only execute if all conditions return `true`
	 */
	require(condition: (args: HookArgs) => boolean): EventHook<HookValues, HookArgs> {
		this.__conditions.push(condition)
		return this
	}

	/* Require card location to be a specified value before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain. Card location must match any of the specified values.
	 */
	requireLocations(locations: CardLocation[]): EventHook<HookValues, HookArgs> {
		return this.require(() => !(this.__subscriber instanceof ServerGame) && locations.includes(this.__subscriber.location))
	}

	/* Ignore control effects
	 * ------------------------------------------------------------------------
	 * This callback will ignore stun and suspension effects applied to card and fire even if the normal callbacks would be skipped.
	 */
	forceIgnoreControlEffects(): EventHook<HookValues, HookArgs> {
		this.__ignoreControlEffects = true
		return this
	}
}

export default class ServerGameEvents {
	private readonly game: ServerGame
	private readonly eventLog: EventLogEntryMessage[][]
	private eventCallbacks: Map<GameEventType, EventCallback<any>[]>
	private eventHooks: Map<GameHookType, EventHook<any, any>[]>

	constructor(game: ServerGame) {
		this.game = game
		this.eventCallbacks = new Map<GameEventType, EventCallback<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
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
