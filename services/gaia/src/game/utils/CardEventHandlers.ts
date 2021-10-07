import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import { OutgoingGlobalMessageHandlers } from '@src/game/handlers/OutgoingGlobalMessageHandlers'
import DiscordIntegration from '@src/game/integrations/DiscordIntegration'
import ServerGame from '@src/game/models/ServerGame'

import EventContext from '../models/EventContext'
import { EventSubscriber } from '../models/ServerGameEvents'

export function cardRequire(game: ServerGame, subscriber: EventSubscriber, func: () => boolean): boolean {
	EventContext.setExecutingEventSubscriber(subscriber)
	let returnValue = false
	try {
		returnValue = func()
	} catch (error) {
		console.error('Unexpected error:\n', error)
		GameHistoryDatabase.logGameError(game, error as Error)
		DiscordIntegration.sendError(game, error as Error)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameError(game, error as Error)
	}
	EventContext.clearExecutingEventSubscriber()
	return returnValue
}

export function cardPerform(game: ServerGame, subscriber: EventSubscriber, func: () => void): void {
	EventContext.setExecutingEventSubscriber(subscriber)
	try {
		func()
	} catch (error) {
		console.error('Unexpected error:\n', error)
		GameHistoryDatabase.logGameError(game, error as Error)
		DiscordIntegration.sendError(game, error as Error)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameError(game, error as Error)
	}
	EventContext.clearExecutingEventSubscriber()
}
