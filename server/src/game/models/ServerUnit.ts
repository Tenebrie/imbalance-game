import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import Unit from '@shared/models/Unit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerBuffContainer from './ServerBuffContainer'
import GameEvent, {CardTakesDamageEventArgs, CardTakesDamageEventOverrideArgs} from './GameEvent'

export default class ServerUnit implements Unit {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame
	isDeathrattleTriggered = false

	get rowIndex(): number {
		return this.game.board.rows.indexOf(this.game.board.getRowWithUnit(this)!)
	}

	get unitIndex(): number {
		const unitRow = this.game.board.rows[this.rowIndex]
		if (!unitRow) { return -1 }
		return unitRow.cards.indexOf(this)
	}

	get buffs(): ServerBuffContainer {
		return this.card.buffs
	}

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner
	}

	addPower(value: number): void {
		this.card.setPower(Math.max(1, this.card.power + value))
	}

	setPower(value: number): void {
		this.card.setPower(value)
	}

	addHealthArmor(value: number): void {
		this.setHealthArmor(Math.max(0, this.card.armor + value))
	}

	setHealthArmor(value: number): void {
		this.card.setArmor(value)
	}

	dealDamage(damage: ServerDamageInstance): void {
		this.dealDamageWithoutDestroying(damage)
		if (this.card.power <= 0) {
			this.destroy()
		}
	}

	dealDamageWithoutDestroying(damageInstance: ServerDamageInstance): void {
		this.card.dealDamageWithoutDestroying(damageInstance)
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
		if (this.isDeathrattleTriggered) {
			return
		}
		this.isDeathrattleTriggered = true

		runCardEventHandler(() => this.card.onBeforeDestroyedAsUnit(this))

		const otherCards = this.game.board.getAllUnits().filter(cardOnBoard => cardOnBoard !== this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onBeforeOtherUnitDestroyed(this))
		})
		this.game.board.destroyUnit(this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onAfterOtherUnitDestroyed(this))
		})

		this.owner.cardGraveyard.addUnit(this.card)
		this.isDeathrattleTriggered = false
	}
}
