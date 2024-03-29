import GameErrorMessage from '@shared/models/network/GameErrorMessage'
import GameMessage from '@shared/models/network/GameMessage'
import { WebMessageType } from '@shared/models/network/messageHandlers/WebMessageTypes'
import PlayerLibrary from '@src/game/players/PlayerLibrary'
import ServerPlayer from '@src/game/players/ServerPlayer'

import ServerGame from '../models/ServerGame'

export const OutgoingGlobalMessageHandlers = {
	notifyPlayerEstablishedConnection(player: ServerPlayer): void {
		player.sendGlobalMessage({
			type: WebMessageType.CONNECTION_CONFIRM,
			data: null,
		})
	},

	notifyPlayerAboutExistingGames(player: ServerPlayer, games: ServerGame[]): void {
		const messages = games.map((game) => new GameMessage(game))

		player.sendGlobalMessage({
			type: WebMessageType.GAMES_INFO,
			data: messages,
		})
	},

	notifyAllPlayersAboutGameCreated(game: ServerGame): void {
		const message = new GameMessage(game)
		PlayerLibrary.onlinePlayers.forEach((player) => {
			player.sendGlobalMessage({
				type: WebMessageType.GAME_CREATED,
				data: message,
			})
		})
	},

	notifyAllPlayersAboutGameUpdated(game: ServerGame): void {
		const message = new GameMessage(game)

		PlayerLibrary.onlinePlayers.forEach((player) => {
			player.sendGlobalMessage({
				type: WebMessageType.GAME_UPDATED,
				data: message,
			})
		})
	},

	notifyAllPlayersAboutGameDestroyed(game: ServerGame): void {
		const message = new GameMessage(game)

		PlayerLibrary.onlinePlayers.forEach((player) => {
			player.sendGlobalMessage({
				type: WebMessageType.GAME_DESTROYED,
				data: message,
			})
		})
	},

	notifyAllPlayersAboutGameError(game: ServerGame, error: Error): void {
		game.allPlayers.forEach((playerInGame) => {
			playerInGame.player.sendGlobalMessage({
				type: WebMessageType.IN_GAME_ERROR,
				data: new GameErrorMessage(error),
			})
		})
	},
}
