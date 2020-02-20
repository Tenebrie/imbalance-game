import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerCardTarget from './ServerCardTarget'
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

	getValidOrders(): ServerCardTarget[] {
		if (this.hasSummoningSickness) {
			return []
		}

		const targetDefinition = this.card.getValidOrderTargetDefinition()
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)
		const targets = []
			.concat(this.card.getValidTargets(TargetMode.ORDER_ATTACK, TargetType.UNIT, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_DRAIN, TargetType.UNIT, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_SUPPORT, TargetType.UNIT, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_DRAIN, TargetType.BOARD_ROW, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW, targetDefinition, { thisUnit: this }, performedOrders))
			.concat(this.card.getValidTargets(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, targetDefinition, { thisUnit: this }, performedOrders))

		targets.forEach(target => { target.sourceUnit = this })

		return targets
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
