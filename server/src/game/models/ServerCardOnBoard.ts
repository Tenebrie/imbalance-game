import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'
import Ruleset from '../Ruleset'
import UnitOrderType from '../shared/enums/UnitOrderType'
import ServerUnitOrder from './ServerUnitOrder'
import Constants from '../shared/Constants'

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
		const damageValue = damage.value - damageReduction
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

	hasActionsRemaining(): boolean {
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)

		const performedOrdersTotal = performedOrders.filter(performedOrder => performedOrder.orderedUnit === this)
		const maxOrdersTotal = this.card.getMaxOrdersTotal(this)

		return performedOrdersTotal.length < maxOrdersTotal
	}

	canPerformOrderOfType(orderType: UnitOrderType): boolean {
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)
		const performedOrdersTotal = performedOrders.filter(performedOrder => performedOrder.orderedUnit === this)

		const performedOrdersOfType = performedOrdersTotal.filter(performedOrder => performedOrder.type === orderType)
		const maxOrdersOfType = this.card.getMaxOrdersOfType(this, orderType)
		if (performedOrdersOfType.length >= maxOrdersOfType) {
			return false
		}

		const otherTypeOrders = performedOrdersTotal.filter(performedOrder => performedOrder.type !== orderType)
		const incompatibleOtherTypeOrder = otherTypeOrders.find(performedOrder => {
			return !this.card.canPerformOrdersSimultaneously(this, orderType, performedOrder.type) && !this.card.canPerformOrdersSimultaneously(this, performedOrder.type, orderType)
		})
		return !incompatibleOtherTypeOrder
	}

	getValidOrders(): ServerUnitOrder[] {
		if (!this.hasActionsRemaining() || this.hasSummoningSickness) {
			return []
		}

		const orders: ServerUnitOrder[] = []

		/* Attacks */
		if (this.canPerformOrderOfType(UnitOrderType.ATTACK)) {
			const opponentUnits = this.game.board.getUnitsOwnedByPlayer(this.game.getOpponent(this.owner))
			const validTargets = opponentUnits.filter(unit => this.canAttackTarget(unit))
			const allowedOrders = validTargets.map(targetUnit => ServerUnitOrder.attack(this, targetUnit))
			allowedOrders.forEach(allowedOrder => orders.push(allowedOrder))
		}

		/* Moves */
		if (this.canPerformOrderOfType(UnitOrderType.MOVE)) {
			const currentRowIndex = this.rowIndex
			if (currentRowIndex > 0 && this.canMoveToRow(this.game.board.rows[currentRowIndex - 1])) {
				orders.push(ServerUnitOrder.move(this, this.game.board.rows[currentRowIndex - 1]))
			}
			if (currentRowIndex < Constants.GAME_BOARD_ROW_COUNT - 1 && this.canMoveToRow(this.game.board.rows[currentRowIndex + 1])) {
				orders.push(ServerUnitOrder.move(this, this.game.board.rows[currentRowIndex + 1]))
			}
		}

		return orders
	}

	canAttackTarget(target: ServerCardOnBoard): boolean {
		const range = this.card.attackRange
		const distance = Math.abs(this.rowIndex - target.rowIndex)
		const isAttackOrderValid = this.card.isUnitAttackOrderValid(this, target)

		return this.owner !== target.owner && distance <= range && isAttackOrderValid
	}

	canMoveToRow(target: ServerGameBoardRow): boolean {
		const range = 1
		const distance = Math.abs(this.rowIndex - target.index)
		const rowUnits = target.cards
		const isMoveOrderValid = this.card.isUnitMoveOrderValid(this, target)
		const opponentsUnits = target.cards.filter(unit => unit.owner === this.game.getOpponent(this.owner))

		return rowUnits.length < Ruleset.MAX_CARDS_PER_ROW && opponentsUnits.length === 0 && distance <= range && isMoveOrderValid
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
