import Unit from '@shared/models/Unit'
import { OrderTarget } from '@src/game/models/ServerBoardOrders'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import ServerBuffContainer from './buffs/ServerBuffContainer'
import ServerCard from './ServerCard'
import ServerDamageInstance from './ServerDamageSource'
import ServerGame from './ServerGame'

export default class ServerUnit implements Unit {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerGroup
	originalOwner: ServerPlayerInGame

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerGroup, originalOwner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner
		this.originalOwner = originalOwner
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
