import Core from '@/Pixi/Core'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import GameStartMessage from '@/Pixi/shared/models/GameStartMessage'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/Pixi/shared/models/network/CardOnBoardMessage'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import CardHandMessage from '@/Pixi/shared/models/network/CardHandMessage'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'
import GameTimeMessage from '@/Pixi/shared/models/network/GameTimeMessage'
import ChatEntryMessage from '@/Pixi/shared/models/network/ChatEntryMessage'
import HiddenCardMessage from '@/Pixi/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/Pixi/shared/models/network/PlayerInGameMessage'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import RenderedUnitOrder from '@/Pixi/models/RenderedUnitOrder'
import AttackOrderMessage from '@/Pixi/shared/models/network/AttackOrderMessage'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import PlayerMessage from '@/Pixi/shared/models/network/PlayerMessage'
import GameBoardMessage from '@/Pixi/shared/models/network/GameBoardMessage'
import GameBoardRowMessage from '@/Pixi/shared/models/network/GameBoardRowMessage'

const handlers: {[ index: string ]: any } = {
	'gameState/start': (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
	},

	'gameState/chat': (data: ChatEntryMessage) => {

	},

	'gameState/hand': (data: CardHandMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data)
	},

	'gameState/deck': (data: CardDeckMessage) => {
		Core.player.cardDeck = ClientCardDeck.fromMessage(data)
	},

	'gameState/player/self': (data: PlayerInGameMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data.cardHand)
		Core.player.cardDeck = ClientCardDeck.fromMessage(data.cardDeck)
		Core.player.morale = data.morale
		Core.player.timeUnits = data.timeUnits
	},

	'gameState/player/opponent': (data: PlayerInGameMessage) => {
		Core.registerOpponent(ClientPlayerInGame.fromMessage(data))
	},

	'gameState/board': (data: GameBoardMessage) => {
		data.rows.forEach(row => {
			Core.board.rows[row.index].setOwner(Core.getPlayer(row.ownerId))
		})
	},

	'gameState/units': (data: CardOnBoardMessage[]) => {
		Core.board.clearBoard()
		data.forEach(message => {
			const card = RenderedCardOnBoard.fromMessage(message)
			Core.board.insertUnit(card, message.rowIndex, message.unitIndex)
		})
	},

	'gameState/board/orders': (data: UnitOrderMessage[]) => {
		const newOrderMessages = data.filter(message => !Core.board.queuedOrders.find(order => order.isEqualToMessage(message)))
		const removedOrders = Core.board.queuedOrders.filter(order => !data.find(message => order.isEqualToMessage(message)))
		const newOrders = newOrderMessages.map(message => RenderedUnitOrder.fromMessage(message))
		Core.board.updateUnitOrders(newOrders, removedOrders)
	},

	'update/game/phase': (data: GameTurnPhase) => {
		Core.game.setTurnPhase(data)
	},

	'update/game/time': (data: GameTimeMessage) => {
		Core.game.currentTime = data.currentTime
		Core.game.maximumTime = data.maximumTime
	},

	'update/board/unitCreated': (data: CardOnBoardMessage) => {
		const card = RenderedCardOnBoard.fromMessage(data)
		Core.board.insertUnit(card, data.rowIndex, data.unitIndex)
	},

	'update/board/unitMoved': (data: CardOnBoardMessage) => {
		const unit = Core.board.findUnitById(data.card.id)
		if (!unit) { return }

		Core.board.removeUnit(unit)
		Core.board.insertUnit(unit, data.rowIndex, data.unitIndex)
	},

	'update/board/unitDestroyed': (data: CardMessage) => {
		const unit = Core.board.findUnitById(data.id)
		if (!unit) { return }

		Core.board.destroyUnit(unit)
	},

	'update/board/row/owner': (data: GameBoardRowMessage) => {
		Core.board.rows[data.index].setOwner(Core.getPlayer(data.ownerId))
	},

	'update/board/card/power': (data: CardMessage) => {
		const cardOnBoard = Core.board.findUnitById(data.id)
		if (!cardOnBoard) { return }

		cardOnBoard.setPower(data.power)
	},

	'update/board/card/attack': (data: CardMessage) => {
		const cardOnBoard = Core.board.findUnitById(data.id)
		if (!cardOnBoard) { return }

		cardOnBoard.setAttack(data.attack)
	},

	'update/player/self/turnStarted': (data: void) => {
		Core.player.startTurn()
	},

	'update/player/opponent/turnStarted': (data: void) => {
		Core.opponent.startTurn()
	},

	'update/player/self/turnEnded': (data: void) => {
		Core.player.endTurn()
	},

	'update/player/opponent/turnEnded': (data: void) => {
		Core.opponent.endTurn()
	},

	'update/player/self/morale': (data: PlayerInGameMessage) => {
		Core.player.morale = data.morale
	},

	'update/player/opponent/morale': (data: PlayerInGameMessage) => {
		Core.opponent.morale = data.morale
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
	},

	'error/generic': (data: string) => {
		console.error('Generic server error:', data)
	}
}

export default handlers
