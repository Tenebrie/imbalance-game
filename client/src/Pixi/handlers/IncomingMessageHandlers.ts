import Core from '@/Pixi/Core'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import CardMessage from '@/shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import GameStartMessage from '@/shared/models/GameStartMessage'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/shared/models/network/CardOnBoardMessage'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import CardHandMessage from '@/shared/models/network/CardHandMessage'
import CardDeckMessage from '@/shared/models/network/CardDeckMessage'
import GameTimeMessage from '@/shared/models/network/GameTimeMessage'
import ChatEntryMessage from '@/shared/models/network/ChatEntryMessage'
import HiddenCardMessage from '@/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'
import GameTurnPhase from '@/shared/enums/GameTurnPhase'
import RenderedAttackOrder from '@/Pixi/models/RenderedAttackOrder'
import AttackOrderMessage from '@/shared/models/network/AttackOrderMessage'

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
		Core.board.clearBoard()
		data.forEach(message => {
			const card = RenderedCardOnBoard.fromMessage(message)
			Core.board.insertCard(card, message.rowIndex, message.unitIndex)
		})
	},

	'gameState/board/attacks': (data: AttackOrderMessage[]) => {
		const newAttackMessages = data.filter(message => !Core.board.queuedAttacks.find(attack => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId))
		const removedAttacks = Core.board.queuedAttacks.filter(attack => !data.find(message => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId))
		const newAttacks = newAttackMessages.map(message => RenderedAttackOrder.fromMessage(message))
		Core.board.updateAttackOrders(newAttacks, removedAttacks)
	},

	'update/game/phase': (data: GameTurnPhase) => {
		Core.game.setTurnPhase(data)
	},

	'update/game/time': (data: GameTimeMessage) => {
		Core.game.currentTime = data.currentTime
		Core.game.maximumTime = data.maximumTime
	},

	'update/board/cardCreated': (data: CardOnBoardMessage) => {
		const card = RenderedCardOnBoard.fromMessage(data)
		Core.board.insertCard(card, data.rowIndex, data.unitIndex)
	},

	'update/board/cardDestroyed': (data: CardMessage) => {
		console.info('Unit destroyed', data.id)
		Core.board.removeCardById(data.id)
	},

	'update/board/card/power': (data: CardMessage) => {
		const cardOnBoard = Core.board.findCardById(data.id)
		if (!cardOnBoard) { return }

		cardOnBoard.setPower(data.power)
	},

	'update/board/card/attack': (data: CardMessage) => {
		const cardOnBoard = Core.board.findCardById(data.id)
		if (!cardOnBoard) { return }

		cardOnBoard.setAttack(data.attack)
	},

	'update/player/self/timeUnits': (data: PlayerInGameMessage) => {
		Core.player.timeUnits = data.timeUnits
	},

	'update/player/opponent/timeUnits': (data: PlayerInGameMessage) => {
		Core.opponent.timeUnits = data.timeUnits
	},

	'update/player/self/hand/cardDrawn': (data: CardMessage[]) => {
		console.info('Cards drawn', data)
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawCardById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addCard(card)
			}
		})
	},

	'update/player/opponent/hand/cardDrawn': (data: HiddenCardMessage[]) => {
		data.forEach(cardMessage => {
			const card = Core.opponent.cardDeck.drawCardById(cardMessage.id)
			if (card) {
				Core.opponent.cardHand.addCard(card)
			}
		})
	},

	'update/player/opponent/hand/cardRevealed': (data: CardMessage) => {
		const card = Core.opponent.cardHand.getCardById(data.id)
		if (card) {
			card.reveal(data.cardType, data.cardClass)
		}
	},

	'update/player/self/hand/cardDestroyed': (data: CardMessage) => {
		Core.player.cardHand.removeCardById(data.id)
	},

	'update/player/opponent/hand/cardDestroyed': (data: CardMessage) => {
		Core.opponent.cardHand.removeCardById(data.id)
	}
}

export default handlers
