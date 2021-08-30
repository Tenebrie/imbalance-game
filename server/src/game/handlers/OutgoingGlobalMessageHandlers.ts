import GameMessage from '@shared/models/network/GameMessage'
import { WebMessageType } from '@shared/models/network/messageHandlers/WebMessageTypes'
import PlayerLibrary from '@src/game/players/PlayerLibrary'
import ServerPlayer from '@src/game/players/ServerPlayer'

import ServerGame from '../models/ServerGame'

const getAllOnlinePlayers = () => PlayerLibrary.playerCache.filter((playerWrapper) => playerWrapper.player.isOnline())

export const OutgoingGlobalMessageHandlers = {
	notifyPlayerAboutExistingGames(player: ServerPlayer, games: ServerGame[]): void {
		const messages = games.map((game) => new GameMessage(game))

		player.sendGlobalMessage({
			type: WebMessageType.GAMES_INFO,
			data: messages,
		})
	},

	notifyAllPlayersAboutGameCreated(game: ServerGame): void {
		const message = new GameMessage(game)
		getAllOnlinePlayers().forEach((playerWrapper) => {
			playerWrapper.player.sendGlobalMessage({
				type: WebMessageType.GAME_CREATED,
				data: message,
			})
		})
	},

	notifyAllPlayersAboutGameUpdated(game: ServerGame): void {
		const message = new GameMessage(game)

		getAllOnlinePlayers().forEach((playerWrapper) => {
			playerWrapper.player.sendGlobalMessage({
				type: WebMessageType.GAME_UPDATED,
				data: message,
			})
		})
	},

	notifyAllPlayersAboutGameDestroyed(game: ServerGame): void {
		const message = new GameMessage(game)

		getAllOnlinePlayers().forEach((playerWrapper) => {
			playerWrapper.player.sendGlobalMessage({
				type: WebMessageType.GAME_DESTROYED,
				data: message,
			})
		})
	},
}
