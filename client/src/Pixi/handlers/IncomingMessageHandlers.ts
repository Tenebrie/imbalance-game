import Core from '@/Pixi/Core'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import CardMessage from '@/shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import GameStartMessage from '@/shared/models/GameStartMessage'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/shared/models/CardOnBoardMessage'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import CardHandMessage from '@/shared/models/network/CardHandMessage'
import CardDeckMessage from '@/shared/models/network/CardDeckMessage'
import ChatEntryMessage from '@/shared/models/network/ChatEntryMessage'
import HiddenCardMessage from '@/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'

const handlers: {[ index: string ]: any } = {
	'gameState/start': (data: GameStartMessage) => {
		Core.gameBoard.setInverted(data.isBoardInverted)
	},

	'gameState/chat': (data: ChatEntryMessage) => {

	},

	'gameState/hand': (data: CardHandMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data)
		console.info('Player hand', Core.player.cardHand)
	},

	'gameState/deck': (data: CardDeckMessage) => {
		Core.player.cardDeck = ClientCardDeck.fromMessage(data)
	},

	'gameState/opponent': (data: PlayerInGameMessage) => {
		Core.registerOpponent(ClientPlayerInGame.fromMessage(data))
	},

	'gameState/board': (data: CardOnBoardMessage[]) => {
		data.forEach(message => {
			const card = RenderedCardOnBoard.fromMessage(message)
			Core.gameBoard.insertCard(card, message.rowIndex, message.unitIndex)
		})
	},

	'update/board/cardCreated': (data: CardOnBoardMessage) => {
		console.info('Unit created', data)
		const card = RenderedCardOnBoard.fromMessage(data)
		Core.gameBoard.insertCard(card, data.rowIndex, data.unitIndex)
	},

	'update/cardsDrawn': (data: CardMessage[]) => {
		console.info('Cards drawn', data)
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawCardById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addCard(card)
			}
		})
	},

	'update/opponentCardsDrawn': (data: HiddenCardMessage[]) => {
		data.forEach(cardMessage => {
			const card = Core.opponent.cardDeck.drawCardById(cardMessage.id)
			if (card) {
				Core.opponent.cardHand.addCard(card)
			}
		})
	},

	'update/opponent/hand/cardRevealed': (data: CardMessage) => {
		const card = Core.opponent.cardHand.getCardById(data.id)
		if (card) {
			card.reveal(data.cardType, data.cardClass)
		}
	},

	'update/player/hand/cardDestroyed': (data: CardMessage) => {
		Core.player.cardHand.removeCardById(data.id)
	},

	'update/opponent/hand/cardDestroyed': (data: CardMessage) => {
		Core.opponent.cardHand.removeCardById(data.id)
	}
}

export default handlers
