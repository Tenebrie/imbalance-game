import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import { OutgoingGlobalMessageHandlers } from '@src/game/handlers/OutgoingGlobalMessageHandlers'
import DiscordIntegration from '@src/game/integrations/DiscordIntegration'
import ServerGame from '@src/game/models/ServerGame'

import { EventSubscriber } from '../models/ServerGameEvents'

export function cardRequire(game: ServerGame, subscriber: EventSubscriber, func: () => boolean): boolean {
	let returnValue = false
	try {
		returnValue = func()
	} catch (error) {
		console.error('Unexpected error:\n', error)
		GameHistoryDatabase.logGameError(game, error as Error)
		DiscordIntegration.getInstance().sendError(game, error as Error)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameError(game, error as Error)
	}
	return returnValue
}

export function cardPerform(game: ServerGame, subscriber: EventSubscriber, func: () => void): void {
	try {
		func()
	} catch (error) {
		console.error('Unexpected error:\n', error)
		GameHistoryDatabase.logGameError(game, error as Error)
		DiscordIntegration.getInstance().sendError(game, error as Error)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameError(game, error as Error)
	}
}
