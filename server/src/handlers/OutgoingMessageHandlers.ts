import * as ws from 'ws'
import ServerCard from '../models/game/ServerCard'
import ServerGame from '../libraries/game/ServerGame'
import ServerPlayer from '../libraries/players/ServerPlayer'
import CardMessage from '../shared/models/network/CardMessage'
import ServerChatEntry from '../../../shared/src/models/ChatEntry'
import CardDeckMessage from '../shared/models/network/CardDeckMessage'
import CardHandMessage from '../shared/models/network/CardHandMessage'
import ChatEntryMessage from '../shared/models/network/ChatEntryMessage'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import HiddenCardMessage from '../shared/models/network/HiddenCardMessage'
import PublicPlayerMessage from '../shared/models/network/PublicPlayerMessage'
import HiddenPlayerInGameMessage from '../shared/models/network/HiddenPlayerInGameMessage'

const gameStateMessages = {
	sendAllChatHistory: (player: ServerPlayer, game: ServerGame) => {
		const chatEntryMessages = game.chatHistory.map(chatEntry => ChatEntryMessage.fromChatEntry(chatEntry))
		player.sendMessage({
			type: 'gameState/chat',
			data: chatEntryMessages
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

	sendOpponent: (player: ServerPlayer, opponent: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/opponent',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(opponent)
		})
	},

	sendBoardState: (player: ServerPlayer, game: ServerGame) => {
		/*const cardMessages = game.board.getAllCards().map(card => CardMessage.fromCard(card))
		player.sendMessage({
			type: 'gameState/board',
			data: cardMessages
		})*/
	},
}

const updateMessages = {
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

	notifyAboutOpponentCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const hiddenCardMessages = cards.map((card: ServerCard) => HiddenCardMessage.fromCard(card))
		player.sendMessage({
			type: 'update/opponentCardsDrawn',
			data: hiddenCardMessages
		})
	},

	notifyAboutCardPlayed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/cardPlayed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/opponent/hand/cardRevealed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutPlayerCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/hand/cardDestroyed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutOpponentCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/opponent/hand/cardDestroyed',
			data: HiddenCardMessage.fromCard(card)
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
}

const systemMessages = {
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

export default {
	...gameStateMessages,
	...updateMessages,
	...systemMessages
}
