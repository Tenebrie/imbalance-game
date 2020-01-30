import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'
import Ruleset from '../Ruleset'
import UnitOrderType from '../shared/enums/UnitOrderType'

export default class ServerCardOnBoard {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame

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

	hasAvailableActions(): boolean {
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)

		const performedOrdersTotal = performedOrders.filter(performedOrder => performedOrder.orderedUnit === this)
		const maxOrdersTotal = this.card.getMaxOrdersTotal(this)
		if (performedOrdersTotal.length >= maxOrdersTotal) {
			return false
		}

		const availableOrders = Object.values(UnitOrderType).filter(orderType => {
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
		})

		return availableOrders.length > 0
	}

	canAttackTarget(target: ServerCardOnBoard): boolean {
		const range = this.card.attackRange
		const distance = Math.abs(this.rowIndex - target.rowIndex)

		return this.owner !== target.owner && distance <= range
	}

	canMoveToRow(target: ServerGameBoardRow): boolean {
		const range = 1
		const distance = Math.abs(this.rowIndex - target.index)
		const rowUnits = target.cards
		const opponentsUnits = target.cards.filter(unit => unit.owner === this.game.getOpponent(this.owner))

		return rowUnits.length < Ruleset.MAX_CARDS_PER_ROW && opponentsUnits.length === 0 && distance <= range
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
