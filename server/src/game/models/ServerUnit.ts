import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import Unit from '@shared/models/Unit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerDamageInstance from './ServerDamageSource'
import { ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerBuffContainer from './buffs/ServerBuffContainer'
import { OrderTarget } from '@src/game/models/ServerBoardOrders'

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
		if (!unitRow) {
			return -1
		}
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

	getValidOrders(): OrderTarget[] {
		return this.card.targeting.getOrderTargets(this.game.board.orders.getOrdersPerformedByUnit(this))
	}
}
