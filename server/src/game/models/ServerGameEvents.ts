import GameEvent from './GameEvent'
import ServerGame from './ServerGame'
import Utils from '../../utils/Utils'
import ServerCard from './ServerCard'
import CardLocation from '@shared/enums/CardLocation'
import {cardPerform, cardRequire} from '../utils/CardEventHandlers'
import ServerBuff from './ServerBuff'
import GameHook from './GameHook'

type EventSubscriber = ServerCard | ServerBuff

export class EventCallback<EventArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __prepares: ((args: EventArgs, preparedState: Record<string, any>) => Record<string, any>)[]
	private readonly __callbacks: ((args: EventArgs, preparedState: Record<string, any>) => void)[]
	private readonly __conditions: ((args: EventArgs) => boolean)[]

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__prepares = []
		this.__callbacks = []
		this.__conditions = []
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

	public get conditions(): ((args: EventArgs) => boolean)[] {
		return this.__conditions
	}

	prepare(callback: (args: EventArgs, preparedState: Record<string, any>) => Record<string, any>): EventCallback<EventArgs> {
		this.__prepares.push(callback)
		return this
	}

	perform(callback: (args: EventArgs, preparedState: Record<string, any>) => void): EventCallback<EventArgs> {
		this.__callbacks.push(callback)
		return this
	}

	require(condition: (args: EventArgs) => boolean): EventCallback<EventArgs> {
		this.__conditions.push(condition)
		return this
	}

	requireLocation(location: CardLocation): EventCallback<EventArgs> {
		return this.require(() => this.__subscriber.location === location)
	}
}

export class EventHook<HookValues, HookArgs> {
	private readonly __subscriber: EventSubscriber
	private readonly __hooks: ((values: HookValues, args?: HookArgs) => HookValues)[]
	private readonly __callbacks: ((args: HookArgs) => void)[]
	private readonly __conditions: ((args: HookArgs) => boolean)[]

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

	replace(func: (values: HookValues, args?: HookArgs) => HookValues): EventHook<HookValues, HookArgs> {
		this.__hooks.push(func)
		return this
	}

	perform(callback: (args: HookArgs) => void): EventHook<HookValues, HookArgs> {
		this.__callbacks.push(callback)
		return this
	}

	require(condition: (args: HookArgs) => boolean): EventHook<HookValues, HookArgs> {
		this.__conditions.push(condition)
		return this
	}

	requireLocation(location: CardLocation): EventHook<HookValues, HookArgs> {
		return this.require(() => this.__subscriber.location === location)
	}
}

export default class ServerGameEvents {
	private game: ServerGame
	private eventCallbacks: Map<GameEvent, EventCallback<any>[]>
	private eventHooks: Map<GameHook, EventHook<any, any>[]>

	constructor(game: ServerGame) {
		this.game = game
		this.eventCallbacks = new Map<GameEvent, EventCallback<any>[]>()
		this.eventHooks = new Map<GameHook, EventHook<any, any>[]>()
		Utils.forEachInNumericEnum(GameEvent, eventType => this.eventCallbacks.set(eventType, []))
		Utils.forEachInNumericEnum(GameHook, hookType => this.eventHooks.set(hookType, []))
	}

	public createCallback<EventArgs>(subscriber: EventSubscriber, event: GameEvent): EventCallback<EventArgs> {
		const eventCallback = new EventCallback<EventArgs>(subscriber)
		this.eventCallbacks.get(event).push(eventCallback)
		return eventCallback
	}

	public createHook<HookValues, HookArgs>(subscriber: EventSubscriber, hook: GameHook): EventHook<HookValues, HookArgs> {
		const eventHook = new EventHook<HookValues, HookArgs>(subscriber)
		this.eventHooks.get(hook).push(eventHook)
		return eventHook
	}

	public unsubscribe(targetSubscriber: EventSubscriber): void {
		Utils.forEachInNumericEnum(GameEvent, eventType => {
			const subscriptions = this.eventCallbacks.get(eventType)
			const filteredSubscriptions = subscriptions.filter(subscription => subscription.subscriber !== targetSubscriber)
			this.eventCallbacks.set(eventType, filteredSubscriptions)
		})
	}

	public postEvent<EventArgs>(event: GameEvent, args: EventArgs | null): void {
		const validCallbacks = this.eventCallbacks
			.get(event)
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(args))
			}))

		const preparedCallbacks = validCallbacks.map(callback => ({
			callback: callback,
			preparedState: callback.prepares.reduce((state, preparator) => preparator(args, state), {})
		}))

		preparedCallbacks
			.forEach(preparedCallback => {
				preparedCallback.callback.callbacks.forEach(callback => {
					cardPerform(() => callback(args, preparedCallback.preparedState))
				})
			})
	}

	public postEffect<EventArgs>(subscriber: EventSubscriber, event: GameEvent, args: EventArgs | null): void {
		const validCallbacks = this.eventCallbacks
			.get(event)
			.filter(subscription => subscription.subscriber === subscriber)
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(args))
			}))

		const preparedCallbacks = validCallbacks.map(callback => ({
			callback: callback,
			preparedState: callback.prepares.reduce((state, preparator) => preparator(args, state), {})
		}))

		preparedCallbacks
			.forEach(preparedCallback => {
				preparedCallback.callback.callbacks.forEach(callback => {
					cardPerform(() => callback(args, preparedCallback.preparedState))
				})
			})
	}

	public applyHooks<HookValues, HookArgs>(hook: GameHook, values: HookValues, args?: HookArgs): HookValues {
		const hookArgs = args ? args : values

		const matchingHooks = this.eventHooks.get(hook)
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
}
