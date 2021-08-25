import ServerGame from '@src/game/models/ServerGame'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import { EventSubscriber } from '../models/ServerGameEvents'
import EventContext from '../models/EventContext'

export function cardRequire(game: ServerGame, subscriber: EventSubscriber, func: () => boolean): boolean {
	EventContext.setExecutingEventSubscriber(subscriber)
	let returnValue = false
	try {
		returnValue = func()
	} catch (error) {
		console.error("Unexpected error in card's Require:", error)
		GameHistoryDatabase.logGameError(game, error)
	}
	EventContext.clearExecutingEventSubscriber()
	return returnValue
}

export function cardPerform(game: ServerGame, subscriber: EventSubscriber, func: () => void): void {
	EventContext.setExecutingEventSubscriber(subscriber)
	try {
		func()
	} catch (error) {
		console.error("Unexpected error in card's Perform:", error)
		GameHistoryDatabase.logGameError(game, error)
	}
	EventContext.clearExecutingEventSubscriber()
}
