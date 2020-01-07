import ServerGame from '../libraries/game/ServerGame'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'

export default {
	'get/chat': (data: void, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		OutgoingMessageHandlers.sendAllChatHistory(playerInGame.player, game)
	},

	'get/hand': (data: void, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		OutgoingMessageHandlers.sendHand(playerInGame.player, game)
	},

	'get/deck': (data: void, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		OutgoingMessageHandlers.sendDeck(playerInGame.player, game)
	},

	'get/opponent': (data: void, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		const opponent = game.players.find(otherPlayer => otherPlayer !== playerInGame)
		if (opponent) {
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, opponent)
		}
	},

	'get/boardState': (data: void, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		OutgoingMessageHandlers.sendBoardState(playerInGame.player, game)
	},

	'post/chat': (data: string, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		game.createChatEntry(playerInGame.player, data)
	},

	'post/playCard': (data: CardPlayedMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = player.cardHand.findCardById(data.id)
		if (!card) { return }

		player.playCard(game, card)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
