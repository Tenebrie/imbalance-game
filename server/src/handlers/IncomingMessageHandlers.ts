import ServerGame from '../libraries/game/ServerGame'
import ServerPlayer from '../libraries/players/ServerPlayer'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

export default {
	'get/chat': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendAllChatHistory(player, game)
	},

	'get/players': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendAllConnectedPlayers(player, game)
	},

	'get/entities': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendBoardState(player, game)
	},

	'post/chat': (data: string, game: ServerGame, player: ServerPlayer) => {
		game.createChatEntry(player, data)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayer) => {
		// No action needed
	}
}
