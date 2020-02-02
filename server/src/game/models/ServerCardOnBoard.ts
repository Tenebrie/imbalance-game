import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerUnitOrder from './ServerUnitOrder'
import Constants from '../shared/Constants'
import ServerTargetDefinition from './ServerTargetDefinition'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'

export default class ServerCardOnBoard {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame
	hasSummoningSickness = true

	get rowIndex(): number {
		return this.game.board.rows.indexOf(this.game.board.getRowWithUnit(this)!)
	}

	get unitIndex(): number {
		const unitRow = this.game.board.rows[this.rowIndex]
		if (!unitRow) { return -1 }
		return unitRow.cards.indexOf(this)
	}

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner

		card.power = card.basePower
		card.attack = card.baseAttack
	}

	setPower(value: number): void {
		this.card.setPower(this, value)
	}

	setAttack(value: number): void {
		this.card.setAttack(this, value)
	}

	dealDamage(damage: ServerDamageInstance): void {
		this.dealDamageWithoutDestroying(damage)
		if (this.card.power <= 0) {
			this.destroy()
		}
	}

	dealDamageWithoutDestroying(damage: ServerDamageInstance): void {
		const damageReduction = this.card.getDamageReduction(this, damage)
		const damageValue = this.card.getDamageTaken(this, damage) - damageReduction
		if (damageValue <= 0) {
			return
		}

		runCardEventHandler(() => this.card.onBeforeDamageTaken(this, damage))
		this.setPower(this.card.power - damage.value)
		runCardEventHandler(() => this.card.onAfterDamageTaken(this, damage))
		if (this.card.power > 0) {
			runCardEventHandler(() => this.card.onDamageSurvived(this, damage))
		}
	}

	heal(damage: ServerDamageInstance): void {
		if (damage.value <= 0) {
			return
		}

		this.setPower(Math.min(this.card.basePower, this.card.power + damage.value))
	}

	isAlive(): boolean {
		return this.card.power > 0
	}

	isDead(): boolean {
		return this.card.power <= 0
	}

	hasActionsRemaining(targetDefinition: ServerTargetDefinition): boolean {
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)
		return performedOrders.length < targetDefinition.getTotalTargetCount()
	}

	canPerformOrder(targetMode: TargetMode, targetType: TargetType, targetDefinition: ServerTargetDefinition): boolean {
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)
		const performedOrdersTotal = performedOrders.filter(performedOrder => performedOrder.orderedUnit === this)

		const performedOrdersOfType = performedOrdersTotal.filter(performedOrder => performedOrder.targetMode === targetMode && performedOrder.targetType === targetType)
		const maxOrdersOfType = targetDefinition.getTargetOfTypeCount(targetMode, targetType)
		if (performedOrdersOfType.length >= maxOrdersOfType) {
			return false
		}

		const otherTypeOrders = performedOrdersTotal.filter(performedOrder => performedOrder.targetMode !== targetMode || performedOrder.targetType !== targetType)
		const incompatibleOtherTypeOrder = otherTypeOrders.find(performedOrder => {
			return !targetDefinition.isValidSimultaneously({ targetMode, targetType }, performedOrder)
		})
		return !incompatibleOtherTypeOrder
	}

	getValidOrders(): ServerUnitOrder[] {
		const targetDefinition = this.card.getUnitOrderTargetDefinition()
		if (this.hasSummoningSickness || !this.hasActionsRemaining(targetDefinition)) {
			return []
		}

		const orders: ServerUnitOrder[] = []

		const unitTargetOrders = [TargetMode.ORDER_ATTACK, TargetMode.ORDER_DRAIN, TargetMode.ORDER_SUPPORT]
		const rowTargetOrders = [TargetMode.ORDER_ATTACK, TargetMode.ORDER_DRAIN, TargetMode.ORDER_SUPPORT, TargetMode.ORDER_MOVE]

		unitTargetOrders.forEach(targetMode => {
			if (!this.canPerformOrder(targetMode, TargetType.UNIT, targetDefinition)) {
				return
			}

			const validTargets = this.game.board.getAllUnits().filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { thisUnit: this, targetUnit: unit }))
			const targetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
			const allowedOrders = validTargets.map(targetUnit => ServerUnitOrder.targetUnit(targetMode, this, targetUnit, targetLabel))
			allowedOrders.forEach(allowedOrder => orders.push(allowedOrder))
		})

		rowTargetOrders.forEach(targetMode => {
			if (!this.canPerformOrder(targetMode, TargetType.BOARD_ROW, targetDefinition)) {
				return
			}

			const validTargets = this.game.board.rows.filter(row => targetDefinition.validate(targetMode, TargetType.BOARD_ROW, { thisUnit: this, targetRow: row }))
			const targetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
			const allowedOrders = validTargets.map(targetRow => ServerUnitOrder.targetRow(targetMode, this, targetRow, targetLabel))
			allowedOrders.forEach(allowedOrder => orders.push(allowedOrder))
		})

		return orders
	}

	destroy(): void {
		runCardEventHandler(() => this.card.onDestroyUnit(this))

		const otherCards = this.game.board.getAllUnits().filter(cardOnBoard => cardOnBoard !== this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onBeforeOtherUnitDestroyed(cardOnBoard, this))
		})
		this.game.board.destroyUnit(this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onAfterOtherUnitDestroyed(cardOnBoard, this))
		})
	}
}
