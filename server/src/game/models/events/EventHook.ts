import CardLocation from '@shared/enums/CardLocation'
import { EventSubscriber } from '../ServerGameEvents'

export class EventHook<HookValues, HookArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __hooks: ((values: HookValues, args: HookArgs) => HookValues)[]
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

	public get hooks(): ((values: HookValues, args: HookArgs) => HookValues)[] {
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
	replace(func: (values: HookValues, args: HookArgs) => HookValues): EventHook<HookValues, HookArgs> {
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
		return this.require(() => !!this.__subscriber && locations.includes(this.__subscriber.location))
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
