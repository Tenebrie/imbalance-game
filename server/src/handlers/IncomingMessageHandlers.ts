import ServerGame from '../libraries/game/ServerGame'
import ServerPlayer from '../libraries/players/ServerPlayer'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

export default {
	'get/chat': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendAllChatHistory(player, game)
	},

	'get/hand': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendHand(player, game)
	},

	'get/deck': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendDeck(player, game)
	},

	'get/opponent': (data: void, game: ServerGame, player: ServerPlayer) => {
		const opponent = game.players.find(playerInGame => playerInGame.player !== player)
		if (opponent) {
			OutgoingMessageHandlers.sendOpponent(player, opponent)
		}
	},

	'get/boardState': (data: void, game: ServerGame, player: ServerPlayer) => {
		OutgoingMessageHandlers.sendBoardState(player, game)
	},

	'post/chat': (data: string, game: ServerGame, player: ServerPlayer) => {
		game.createChatEntry(player, data)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayer) => {
		// No action needed
	}
}
