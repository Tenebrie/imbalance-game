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
import GameTimeMessage from '@/shared/models/network/GameTimeMessage'
import ChatEntryMessage from '@/shared/models/network/ChatEntryMessage'
import HiddenCardMessage from '@/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'

const handlers: {[ index: string ]: any } = {
	'gameState/start': (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
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
			Core.board.insertCard(card, message.rowIndex, message.unitIndex)
		})
	},

	'update/game/time': (data: GameTimeMessage) => {
		console.log(`Advancing time to ${data.currentTime}/${data.maximumTime}`)
		Core.game.currentTime = data.currentTime
		Core.game.maximumTime = data.maximumTime
	},

	'update/board/cardCreated': (data: CardOnBoardMessage) => {
		console.info('Unit created', data)
		const card = RenderedCardOnBoard.fromMessage(data)
		Core.board.insertCard(card, data.rowIndex, data.unitIndex)
	},

	'update/board/cardDestroyed': (data: CardMessage) => {
		console.info('Unit destroyed', data.id)
		Core.board.removeCardById(data.id)
	},

	'update/board/card/initiative': (data: CardMessage) => {
		const cardOnBoard = Core.board.findCardById(data.id)
		if (!cardOnBoard) { return }

		cardOnBoard.card.initiative = data.initiative
	},

	'update/player/timeUnits': (data: PlayerInGameMessage) => {
		const playerInGame = Core.getPlayer(data.player.id)
		if (!playerInGame) {
			return
		}
		playerInGame.timeUnits = data.timeUnits
	},

	'update/player/hand/cardDrawn': (data: CardMessage[]) => {
		console.info('Cards drawn', data)
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawCardById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addCard(card)
			}
		})
	},

	'update/opponent/hand/cardDrawn': (data: HiddenCardMessage[]) => {
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
