import ServerGame from './ServerGame'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerUnitOrder from './ServerUnitOrder'
import UnitOrderType from '../shared/enums/UnitOrderType'
import Ruleset from '../Ruleset'
import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

export default class ServerGameBoardOrders {
	game: ServerGame
	performedOrders: ServerUnitOrder[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public performUnitOrder(order: ServerUnitOrder): void {
		if (!this.isOrderValid(order)) {
			return
		}

		if (order.orderedUnit.card.requireCustomOrderLogic(order.orderedUnit, order)) {
			order.orderedUnit.card.onUnitCustomOrder(order.orderedUnit, order)
			return
		}

		order.orderedUnit.card.onBeforeUnitOrderIssued(order.orderedUnit, order)

		if (order.type === UnitOrderType.ATTACK) {
			this.performUnitAttack(order.orderedUnit, order.targetUnit)
		} else if (order.type === UnitOrderType.MOVE) {
			this.performUnitMove(order.orderedUnit, order.targetRow)
		}

		order.orderedUnit.card.onAfterUnitOrderIssued(order.orderedUnit, order)
	}

	private isOrderValid(order: ServerUnitOrder): boolean {
		return !!order.orderedUnit.getValidOrders().find(validOrder => order.isEqual(validOrder))
	}

	public performUnitAttack(orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): void {
		this.performedOrders.push(ServerUnitOrder.attack(orderedUnit, targetUnit))

		runCardEventHandler(() => orderedUnit.card.onBeforePerformingAttack(orderedUnit, targetUnit))
		runCardEventHandler(() => targetUnit.card.onBeforeBeingAttacked(targetUnit, orderedUnit))

		OutgoingAnimationMessages.triggerAnimationForAll(this.game, ServerAnimation.unitAttack(orderedUnit, targetUnit))

		const attack = orderedUnit.card.getAttackDamage(orderedUnit, targetUnit) + orderedUnit.card.getBonusAttackDamage(orderedUnit, targetUnit)
		targetUnit.dealDamage(ServerDamageInstance.fromUnit(attack, orderedUnit))

		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(this.game, this.game.getOpponent(orderedUnit.owner))
		OutgoingAnimationMessages.triggerAnimationForAll(this.game, ServerAnimation.postUnitAttack())

		if (orderedUnit.isAlive()) {
			runCardEventHandler(() => orderedUnit.card.onAfterPerformingAttack(orderedUnit, targetUnit))
		}
		if (targetUnit.isAlive()) {
			runCardEventHandler(() => targetUnit.card.onAfterBeingAttacked(targetUnit, orderedUnit))
		}
	}

	public performUnitMove(orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		this.performedOrders.push(ServerUnitOrder.move(orderedUnit, targetRow))

		const currentRow = this.game.board.getRowWithUnit(orderedUnit)
		if (!currentRow || targetRow.cards.length === Ruleset.MAX_CARDS_PER_ROW) { return }

		runCardEventHandler(() => orderedUnit.card.onBeforePerformingMove(orderedUnit, targetRow))
		this.game.board.moveUnit(orderedUnit, targetRow.index, targetRow.cards.length)

		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(this.game, this.game.getOpponent(orderedUnit.owner))
		OutgoingAnimationMessages.triggerAnimationForAll(this.game, ServerAnimation.allUnitsMove())

		if (orderedUnit.isAlive()) {
			runCardEventHandler(() => orderedUnit.card.onAfterPerformingMove(orderedUnit, targetRow))
		}
	}

	public getOrdersPerformedByUnit(unit: ServerCardOnBoard) {
		return this.performedOrders.filter(order => order.orderedUnit === unit)
	}

	public clearPerformedOrders() {
		this.performedOrders = []
	}
}
