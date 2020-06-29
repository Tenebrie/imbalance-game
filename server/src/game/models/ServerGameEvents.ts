import GameEvent from './GameEvent'
import ServerGame from './ServerGame'
import Utils from '../../utils/Utils'
import ServerCard from './ServerCard'
import CardLocation from '@shared/enums/CardLocation'
import {cardPerform, cardRequire} from '../utils/CardEventHandlers'
import ServerBuff from './ServerBuff'

type EventSubscriber = ServerCard | ServerBuff

export class EventSubscription<T> {
	private readonly __subscriber: EventSubscriber
	private readonly __callbacks: ((args: T) => void)[]
	private readonly __conditions: ((args: T) => boolean)[]
	private readonly __overrides: ((args: T) => T)[]

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__callbacks = []
		this.__conditions = []
		this.__overrides = []
	}

	public get subscriber(): EventSubscriber {
		return this.__subscriber
	}

	public get callbacks(): ((args: T) => void)[] {
		return this.__callbacks
	}

	public get conditions(): ((args: T) => boolean)[] {
		return this.__conditions
	}

	public get overrides(): ((args: T) => T)[] {
		return this.__overrides
	}

	perform(callback: (args: T) => void): EventSubscription<T> {
		this.__callbacks.push(callback)
		return this
	}

	require(condition: (args: T) => boolean): EventSubscription<T> {
		this.__conditions.push(condition)
		return this
	}

	override(override: (args: T) => T): EventSubscription<T> {
		this.__overrides.push(override)
		return this
	}

	requireLocation(location: CardLocation): EventSubscription<T> {
		return this.require(() => this.__subscriber.location === location)
	}
}

export default class ServerGameEvents {
	private game: ServerGame
	private subscriptions: Map<GameEvent, EventSubscription<any>[]>

	constructor(game: ServerGame) {
		this.game = game
		this.subscriptions = new Map<GameEvent, EventSubscription<any>[]>()
		Utils.forEachInNumericEnum(GameEvent, eventType => this.subscriptions.set(eventType, []))
	}

	public subscribe<T>(subscriber: EventSubscriber, event: GameEvent): EventSubscription<T> {
		const eventSubscription = new EventSubscription<T>(subscriber)
		this.subscriptions.get(event).push(eventSubscription)
		return eventSubscription
	}

	public unsubscribe(targetSubscriber: EventSubscriber): void {
		Utils.forEachInNumericEnum(GameEvent, eventType => {
			const subscriptions = this.subscriptions.get(eventType)
			const filteredSubscriptions = subscriptions.filter(subscription => subscription.subscriber !== targetSubscriber)
			this.subscriptions.set(eventType, filteredSubscriptions)
		})
	}

	public postEvent<T>(event: GameEvent, args: T | null): void {
		this.subscriptions.get(event)
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(args))
			}))
			.forEach(subscription => subscription.callbacks.forEach(callback => {
				cardPerform(() => callback(args))
			}))
	}

	public postEffect<T>(subscriber: EventSubscriber, event: GameEvent, args: T | null): void {
		this.subscriptions.get(event)
			.filter(subscription => subscription.subscriber === subscriber)
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(args))
			}))
			.forEach(subscription => subscription.callbacks.forEach(callback => {
				cardPerform(() => callback(args))
			}))
	}

	public applyOverrides<T>(event: GameEvent, args: T): T {
		return this.subscriptions.get(event)
			.filter(subscription => !subscription.conditions.find(condition => {
				return cardRequire(() => !condition(args))
			}))
			.reduce((accOuter, subscription) => subscription.overrides.reduce((accInner, override) => override(accInner), accOuter), args)
	}
}
