import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerCardTarget from './ServerCardTarget'
import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import Constants from '@shared/Constants'

export default class ServerBoardOrders {
	readonly game: ServerGame
	readonly performedOrders: ServerCardTarget[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public performUnitOrder(order: ServerCardTarget): void {
		if (!this.isOrderValid(order)) {
			return
		}

		if (order.sourceUnit.card.isRequireCustomOrderLogic(order.sourceUnit, order)) {
			order.sourceUnit.card.onUnitCustomOrderPerformed(order.sourceUnit, order)
			return
		}

		order.sourceUnit.card.onBeforeUnitOrderIssued(order.sourceUnit, order)

		this.performedOrders.push(order)

		if (order.targetMode === TargetMode.ORDER_ATTACK && order.targetType === TargetType.UNIT) {
			this.performUnitAttack(TargetMode.ORDER_ATTACK, order.sourceUnit, order.targetUnit)
		} else if (order.targetMode === TargetMode.ORDER_DRAIN && order.targetType === TargetType.UNIT) {
			this.performUnitAttack(TargetMode.ORDER_DRAIN, order.sourceUnit, order.targetUnit)
		} else if (order.targetMode === TargetMode.ORDER_ATTACK && order.targetType === TargetType.BOARD_ROW) {
			this.performRowAttack(TargetMode.ORDER_ATTACK, order.sourceUnit, order.targetRow)
		} else if (order.targetMode === TargetMode.ORDER_MOVE && order.targetType === TargetType.BOARD_ROW) {
			this.performUnitMove(order.sourceUnit, order.targetRow)
		} else if (order.targetMode === TargetMode.ORDER_SUPPORT && order.targetType === TargetType.UNIT) {
			this.performUnitSupport(order.sourceUnit, order.targetUnit)
		} else if (order.targetMode === TargetMode.ORDER_SUPPORT && order.targetType === TargetType.BOARD_ROW) {
			this.performRowSupport(order.sourceUnit, order.targetRow)
		}

		order.sourceUnit.card.onAfterUnitOrderIssued(order.sourceUnit, order)
	}

	private isOrderValid(order: ServerCardTarget): boolean {
		return !!order.sourceUnit.getValidOrders().find(validOrder => order.isEqual(validOrder))
	}

	public performUnitAttack(targetMode: TargetMode, orderedUnit: ServerUnit, targetUnit: ServerUnit): void {
		runCardEventHandler(() => orderedUnit.card.onBeforePerformingUnitAttack(orderedUnit, targetUnit, targetMode))

		const previousTargets = this.getOrdersPerformedByUnit(orderedUnit)
		const targetDefinition = orderedUnit.card.getValidOrderTargetDefinition()
		if (targetMode === TargetMode.ORDER_ATTACK && !targetDefinition.validate(TargetMode.ATTACK_ORDERED, TargetType.UNIT, { thisUnit: orderedUnit, targetUnit, previousTargets })) {
			return
		}
		runCardEventHandler(() => targetUnit.card.onBeforeBeingAttacked(targetUnit, orderedUnit))

		OutgoingAnimationMessages.triggerAnimation(this.game, ServerAnimation.unitAttack(orderedUnit, [targetUnit]))

		const attack = orderedUnit.card.getAttackDamage(orderedUnit, targetUnit, targetMode, TargetType.UNIT) + orderedUnit.card.getBonusAttackDamage(orderedUnit, targetUnit, targetMode, TargetType.UNIT)
		const dealtDamage = targetUnit.dealDamage(ServerDamageInstance.fromUnit(attack, orderedUnit))

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
		OutgoingAnimationMessages.triggerAnimation(this.game, ServerAnimation.postUnitAttack())

		if (orderedUnit.isAlive()) {
			runCardEventHandler(() => orderedUnit.card.onAfterPerformingUnitAttack(orderedUnit, targetUnit, targetMode, dealtDamage))
		}
		if (targetUnit.isAlive()) {
			runCardEventHandler(() => targetUnit.card.onAfterBeingAttacked(targetUnit, orderedUnit))
		}
	}

	public performRowAttack(targetMode: TargetMode, orderedUnit: ServerUnit, targetRow: ServerBoardRow): void {
		runCardEventHandler(() => orderedUnit.card.onBeforePerformingRowAttack(orderedUnit, targetRow, targetMode))

		const previousTargets = this.getOrdersPerformedByUnit(orderedUnit)
		const targetDefinition = orderedUnit.card.getValidOrderTargetDefinition()
		let validTargets = targetRow.cards.filter(unit => targetDefinition.validate(TargetMode.ATTACK_ORDERED, TargetType.UNIT, { thisUnit: orderedUnit, targetRow: targetRow, targetUnit: unit, previousTargets }))
		if (validTargets.length === 0) {
			return
		}

		validTargets.forEach(targetUnit => {
			runCardEventHandler(() => targetUnit.card.onBeforeBeingAttacked(targetUnit, orderedUnit))
		})

		OutgoingAnimationMessages.triggerAnimation(this.game, ServerAnimation.unitAttack(orderedUnit, validTargets))

		validTargets = validTargets.filter(unit => unit.isAlive())
		validTargets.forEach(targetUnit => {
			const attack = orderedUnit.card.getAttackDamage(orderedUnit, targetUnit, targetMode, TargetType.BOARD_ROW) + orderedUnit.card.getBonusAttackDamage(orderedUnit, targetUnit, targetMode, TargetType.BOARD_ROW)
			targetUnit.dealDamage(ServerDamageInstance.fromUnit(attack, orderedUnit))
		})

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
		OutgoingAnimationMessages.triggerAnimation(this.game, ServerAnimation.postUnitAttack())

		if (orderedUnit.isAlive()) {
			runCardEventHandler(() => orderedUnit.card.onAfterPerformingRowAttack(orderedUnit, targetRow, targetMode))
		}

		validTargets = validTargets.filter(unit => unit.isAlive())
		validTargets.forEach(targetUnit => {
			runCardEventHandler(() => targetUnit.card.onAfterBeingAttacked(targetUnit, orderedUnit))
		})

	}

	public performUnitMove(orderedUnit: ServerUnit, targetRow: ServerBoardRow): void {
		const currentRow = this.game.board.getRowWithUnit(orderedUnit)
		if (!currentRow || targetRow.cards.length === Constants.MAX_CARDS_PER_ROW) { return }

		runCardEventHandler(() => orderedUnit.card.onBeforePerformingMove(orderedUnit, targetRow))
		this.game.board.moveUnit(orderedUnit, targetRow.index, targetRow.cards.length)

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
		OutgoingAnimationMessages.triggerAnimation(this.game, ServerAnimation.allUnitsMove())

		if (orderedUnit.isAlive()) {
			runCardEventHandler(() => orderedUnit.card.onAfterPerformingMove(orderedUnit, targetRow))
		}
	}

	public performUnitSupport(orderedUnit: ServerUnit, targetUnit: ServerUnit): void {
		runCardEventHandler(() => targetUnit.card.onBeforeBeingSupported(targetUnit, orderedUnit))

		if (orderedUnit.isDead() || targetUnit.isDead()) {
			return
		}

		runCardEventHandler(() => orderedUnit.card.onPerformingUnitSupport(orderedUnit, targetUnit))

		if (targetUnit.isAlive()) {
			runCardEventHandler(() => targetUnit.card.onAfterBeingSupported(targetUnit, orderedUnit))
		}
	}

	public performRowSupport(orderedUnit: ServerUnit, targetRow: ServerBoardRow): void {
		targetRow.cards.forEach(targetUnit => {
			runCardEventHandler(() => targetUnit.card.onBeforeBeingSupported(targetUnit, orderedUnit))
		})

		if (orderedUnit.isDead()) { return }

		runCardEventHandler(() => orderedUnit.card.onPerformingRowSupport(orderedUnit, targetRow))

		targetRow.cards.forEach(targetUnit => {
			runCardEventHandler(() => targetUnit.card.onAfterBeingSupported(targetUnit, orderedUnit))
		})
	}

	public getOrdersPerformedByUnit(unit: ServerUnit): ServerCardTarget[] {
		return this.performedOrders.filter(order => order.sourceUnit === unit)
	}

	public clearPerformedOrders() {
		while (this.performedOrders.length > 0) {
			this.performedOrders.splice(0, 1)
		}
	}
}
