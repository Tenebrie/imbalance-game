import { EventSubscriber } from '../ServerGameEvents'

export class EventHook<EditableValues, FixedValues> {
	private readonly __subscriber: EventSubscriber
	private readonly __hooks: ((values: EditableValues, args: FixedValues) => EditableValues)[]
	private readonly __callbacks: ((args: FixedValues, values: EditableValues) => void)[]
	private readonly __conditions: ((args: FixedValues, values: EditableValues) => boolean)[]
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

	public get hooks(): ((values: EditableValues, args: FixedValues) => EditableValues)[] {
		return this.__hooks
	}

	public get callbacks(): ((args: FixedValues, values: EditableValues) => void)[] {
		return this.__callbacks
	}

	public get conditions(): ((args: FixedValues, values: EditableValues) => boolean)[] {
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
	replace(func: (values: EditableValues, args: FixedValues) => EditableValues): EventHook<EditableValues, FixedValues> {
		this.__hooks.push(func)
		return this
	}

	/* Perform a callback when a hook event occurs and all conditions are satisfied
	 * ------------------------------------------------------------------------
	 * The `args` argument provided to the callback is the original one, not affected by `replace` result.
	 */
	perform(callback: (args: FixedValues, values: EditableValues) => void): EventHook<EditableValues, FixedValues> {
		this.__callbacks.push(callback)
		return this
	}

	/* Require a condition to be true before callback execution
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The hook will only execute if all conditions return `true`
	 */
	require(condition: (args: FixedValues, values: EditableValues) => boolean): EventHook<EditableValues, FixedValues> {
		this.__conditions.push(condition)
		return this
	}

	/* Ignore control effects
	 * ------------------------------------------------------------------------
	 * This callback will ignore stun and suspension effects applied to card and fire even if the normal callbacks would be skipped.
	 */
	forceIgnoreControlEffects(): EventHook<EditableValues, FixedValues> {
		this.__ignoreControlEffects = true
		return this
	}
}
