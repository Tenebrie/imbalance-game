import * as ws from 'ws'
import ServerGame from '../libraries/game/ServerGame'
import ChatEntry from '../models/ChatEntry'
import ServerCard from '../models/game/ServerCard'
import ServerPlayer from '../libraries/players/ServerPlayer'
import CardMessage from '../models/network/CardMessage'
import ChatEntryMessage from '../models/network/ChatEntryMessage'
import PublicPlayerMessage from '../models/network/PublicPlayerMessage'

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

	 sendBoardState: (player: ServerPlayer, game: ServerGame) => {
		const cardMessages = game.board.getAllCards().map(card => CardMessage.fromCard(card, player))
		player.sendMessage({
			type: 'gameState/board',
			data: cardMessages
		})
	},

	notifyAboutChatEntry(player: ServerPlayer, chatEntry: ChatEntry) {
		player.sendMessage({
			type: 'chat/message',
			data: ChatEntryMessage.fromChatEntry(chatEntry)
		})
	},

	notifyAboutCardPlayed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/cardPlayed',
			data: CardMessage.fromCard(card, player)
		})
	},

	notifyAboutCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/cardDestroyed',
			data: CardMessage.fromCard(card, player)
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
