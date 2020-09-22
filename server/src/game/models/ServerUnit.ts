import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import Unit from '@shared/models/Unit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerDamageInstance from './ServerDamageSource'
import {ServerCardTargetCard, ServerCardTargetRow} from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerBuffContainer from './ServerBuffContainer'

export default class ServerUnit implements Unit {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner
	}

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

	dealDamage(damageInstance: ServerDamageInstance): void {
		this.card.dealDamage(damageInstance)
	}

	heal(healingInstance: ServerDamageInstance): void {
		this.card.heal(healingInstance)
	}

	isAlive(): boolean {
		return !this.card.isDead
	}

	isDead(): boolean {
		return this.card.isDead
	}

	getValidOrders(): (ServerCardTargetCard | ServerCardTargetRow)[] {
		const targetDefinitions = this.card.targeting.getUnitOrderTargetDefinitions()
		const performedOrders = this.game.board.orders.getOrdersPerformedByUnit(this)
		let targets: (ServerCardTargetCard | ServerCardTargetRow)[] = []
		targetDefinitions.forEach(targetDefinition => {
			targets = targets
				.concat(this.card.targeting.getValidTargetsForCards(TargetMode.UNIT_ORDER, TargetType.UNIT, targetDefinition, performedOrders))
				.concat(this.card.targeting.getValidTargetsForRows(TargetMode.UNIT_ORDER, targetDefinition, performedOrders))
				.concat(this.card.targeting.getValidTargetsForCards(TargetMode.UNIT_ORDER, TargetType.CARD_IN_UNIT_HAND, targetDefinition, performedOrders))
				.concat(this.card.targeting.getValidTargetsForCards(TargetMode.UNIT_ORDER, TargetType.CARD_IN_SPELL_HAND, targetDefinition, performedOrders))
		})

		return targets
	}
}
