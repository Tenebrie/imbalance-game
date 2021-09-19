import { EventSubscriber } from '../ServerGameEvents'
import { GameEvent } from './GameEventCreators'

export class EventSubscription<EventArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __prepares: ((args: EventArgs, preparedState: Record<string, any>) => Record<string, any>)[]
	private readonly __callbacks: ((args: EventArgs, preparedState: Record<string, any>) => void)[]
	private readonly __conditions: ((args: EventArgs, rawEvent: GameEvent) => boolean)[]
	private readonly __immediateConditions: ((args: EventArgs, preparedState: Record<string, any>, rawEvent: GameEvent) => boolean)[]
	private __ignoreControlEffects: boolean

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__prepares = []
		this.__callbacks = []
		this.__conditions = []
		this.__immediateConditions = []
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

	public get immediateConditions(): ((args: EventArgs, preparedState: Record<string, any>, rawEvent: GameEvent) => boolean)[] {
		return this.__immediateConditions
	}

	public get ignoreControlEffects(): boolean {
		return this.__ignoreControlEffects
	}

	/* Prepare state to be used in the callback
	 * ----------------------------------------
	 * State is being prepared synchronously on every queued callback before any of them execute. As a result, this is useful
	 * to synchronize multiple copies of the same card and prevent effect race conditions.
	 */
	prepare(callback: (args: EventArgs, preparedState: Record<string, any>) => Record<string, any>): EventSubscription<EventArgs> {
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
	perform(callback: (args: EventArgs, preparedState: Record<string, any>) => void): EventSubscription<EventArgs> {
		this.__callbacks.push(callback)
		return this
	}

	/* Require a condition to be true before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The callback will only execute if all conditions return `true` or other truthy value.
	 * All require conditions must be true at the moment of event happening, **but not** callback execution.
	 */
	require(condition: (args: EventArgs, rawEvent: GameEvent) => boolean): EventSubscription<EventArgs> {
		this.__conditions.push(condition)
		return this
	}

	/* Require a condition to be true before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The callback will only execute if all conditions return `true` or other truthy value.
	 * All requireImmediate conditions must be true at the moment of event happening **and** callback execution.
	 */
	requireImmediate(
		condition: (args: EventArgs, preparedState: Record<string, any>, rawEvent: GameEvent) => boolean
	): EventSubscription<EventArgs> {
		this.__immediateConditions.push(condition)
		return this
	}

	/* Ignore control effects
	 * ------------------------------------------------------------------------
	 * This callback will ignore stun and suspension effects applied to card and fire even if the normal callbacks would be skipped.
	 */
	forceIgnoreControlEffects(): EventSubscription<EventArgs> {
		this.__ignoreControlEffects = true
		return this
	}
}
