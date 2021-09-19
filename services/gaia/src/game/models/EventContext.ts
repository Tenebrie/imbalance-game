import ServerGame from './ServerGame'
import { EventSubscriber } from './ServerGameEvents'

class EventContext {
	private __game: ServerGame | null = null
	private __executingEventSubscriber: EventSubscriber | null = null

	public get game(): ServerGame | null {
		return this.__game
	}

	public get executingEventSubscriber(): EventSubscriber | null {
		return this.__executingEventSubscriber
	}

	public setGame(game: ServerGame): void {
		this.__game = game
	}

	public setExecutingEventSubscriber(subscriber: EventSubscriber): void {
		this.__executingEventSubscriber = subscriber
	}

	public clearExecutingEventSubscriber(): void {
		this.__executingEventSubscriber = null
	}

	public clear(): void {
		this.__game = null
		this.__executingEventSubscriber = null
	}
}

export default new EventContext()
