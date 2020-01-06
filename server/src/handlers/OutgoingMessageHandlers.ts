import * as ws from 'ws'
import ServerCard from '../models/game/ServerCard'
import ServerGame from '../libraries/game/ServerGame'
import ServerPlayer from '../libraries/players/ServerPlayer'
import CardMessage from '../shared/models/network/CardMessage'
import ServerChatEntry from '../../../shared/src/models/ChatEntry'
import ChatEntryMessage from '../shared/models/network/ChatEntryMessage'
import PublicPlayerMessage from '../shared/models/network/PublicPlayerMessage'
import PlayerInGameMessage from '../shared/models/network/PlayerInGameMessage'
import CardDeckMessage from '../shared/models/network/CardDeckMessage'
import CardHandMessage from '../shared/models/network/CardHandMessage'

export default {
	sendAllChatHistory: (player: ServerPlayer, game: ServerGame) => {
		const chatEntryMessages = game.chatHistory.map(chatEntry => ChatEntryMessage.fromChatEntry(chatEntry))
		player.sendMessage({
			type: 'gameState/chat',
			data: chatEntryMessages
		})
	},

	sendAllConnectedPlayers: (player: ServerPlayer, game: ServerGame) => {
		const publicPlayerMessages = game.players.map(playerInGame => PublicPlayerMessage.fromPlayer(playerInGame.player))
		player.sendMessage({
			type: 'gameState/players',
			data: publicPlayerMessages
		})
	},

	sendHand: (player: ServerPlayer, game: ServerGame) => {
		const cardDeck = game.getPlayerInGame(player).cardHand
		player.sendMessage({
			type: 'gameState/hand',
			data: CardHandMessage.fromHand(cardDeck)
		})
	},

	sendDeck: (player: ServerPlayer, game: ServerGame) => {
		const cardDeck = game.getPlayerInGame(player).cardDeck
		player.sendMessage({
			type: 'gameState/deck',
			data: CardDeckMessage.fromDeck(cardDeck)
		})
	},

	sendOpponent: (player: ServerPlayer, game: ServerGame) => {
		const opponentPlayerInGame = game.players.find(playerInGame => playerInGame.player !== player)
		if (!opponentPlayerInGame) { return }

		player.sendMessage({
			type: 'gameState/opponent',
			data: PlayerInGameMessage.fromPlayerInGame(opponentPlayerInGame)
		})
	},

	sendBoardState: (player: ServerPlayer, game: ServerGame) => {
		const cardMessages = game.board.getAllCards().map(card => CardMessage.fromCard(card))
		player.sendMessage({
			type: 'gameState/board',
			data: cardMessages
		})
	},

	notifyAboutChatEntry(player: ServerPlayer, chatEntry: ServerChatEntry) {
		player.sendMessage({
			type: 'chat/message',
			data: ChatEntryMessage.fromChatEntry(chatEntry)
		})
	},

	notifyAboutCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const cardMessages = cards.map((card: ServerCard) => CardMessage.fromCard(card))

		player.sendMessage({
			type: 'update/cardsDrawn',
			data: cardMessages
		})
	},

	notifyAboutCardPlayed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/cardPlayed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/cardDestroyed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutPlayerConnected(player: ServerPlayer, connectedPlayer: ServerPlayer) {
		player.sendMessage({
			type: 'update/playerConnected',
			data: PublicPlayerMessage.fromPlayer(connectedPlayer)
		})
	},

	notifyAboutPlayerDisconnected(player: ServerPlayer, disconnectedPlayer: ServerPlayer) {
		player.sendMessage({
			type: 'update/playerDisconnected',
			data: PublicPlayerMessage.fromPlayer(disconnectedPlayer)
		})
	},

	notifyAboutGameShutdown(player: ServerPlayer) {
		player.sendMessage({
			type: 'command/disconnect',
			data: { reason: 'ServerGame shutdown' }
		})
	},

	notifyAboutInvalidGameID(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid game ID or player token'
		}))
	},

	notifyAboutInvalidMessageType(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid or missing message type'
		}))
	}
}
