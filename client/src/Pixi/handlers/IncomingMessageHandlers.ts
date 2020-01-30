import Core from '@/Pixi/Core'
import store from '@/Vue/store'
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
import HiddenCardMessage from '@/Pixi/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/Pixi/shared/models/network/PlayerInGameMessage'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import RenderedUnitOrder from '@/Pixi/models/RenderedUnitOrder'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import GameBoardMessage from '@/Pixi/shared/models/network/GameBoardMessage'
import GameBoardRowMessage from '@/Pixi/shared/models/network/GameBoardRowMessage'
import AnimationMessage from '@/Pixi/shared/models/network/AnimationMessage'
import AnimationType from '@/Pixi/shared/enums/AnimationType'

const handlers: {[ index: string ]: any } = {
	'gameState/start': (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
		store.dispatch.gameStateModule.startGame()
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
		const playerInGame = ClientPlayerInGame.fromMessage(data)
		Core.registerOpponent(playerInGame)
		store.commit.gameStateModule.setOpponentData(playerInGame.player)
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
		Core.board.rows[data.index].setOwner(Core.getPlayerOrNull(data.ownerId))
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

	'update/player/self/victory': (data: PlayerInGameMessage) => {
		store.dispatch.gameStateModule.winGame()
	},

	'update/player/self/defeat': (data: PlayerInGameMessage) => {
		store.dispatch.gameStateModule.loseGame()
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
		Core.opponent.cardHand.reveal(data)
	},

	'update/player/self/hand/cardDestroyed': (data: CardMessage) => {
		Core.player.cardHand.removeCardById(data.id)
	},

	'update/player/opponent/hand/cardDestroyed': (data: CardMessage) => {
		const card = Core.opponent.cardHand.getCardById(data.id)
		if (!card) { return }

		if (Core.mainHandler.announcedCard === card) {
			Core.mainHandler.clearAnnouncedCard()
		}
		Core.opponent.cardHand.removeCard(card)
	},

	'animation/generic': (data: AnimationMessage) => {
		let animationDuration = 500

		if (data.type === AnimationType.CARD_PLAY) {
			const announcedCard = Core.opponent.cardHand.getCardById(data.targetCardId)!
			Core.mainHandler.announceCard(announcedCard)
			animationDuration = 3000
		} else if (data.type === AnimationType.UNIT_ATTACK) {
			animationDuration = 300
			const sourceUnit = Core.board.findUnitById(data.sourceUnitId)
			const targetUnit = Core.board.findUnitById(data.targetUnitId)
			Core.mainHandler.projectileSystem.createUnitAttackProjectile(sourceUnit, targetUnit)
		} else if (data.type === AnimationType.POST_UNIT_ATTACK) {
			animationDuration = 100
		} else if (data.type === AnimationType.ALL_UNITS_MOVE) {
			animationDuration = 750
		}
		Core.mainHandler.triggerAnimation(animationDuration)
	},

	'command/disconnect': (data: void) => {
		store.dispatch.leaveGame()
	},

	'error/generic': (data: string) => {
		console.error('Server error:', data)
	}
}

export default handlers
