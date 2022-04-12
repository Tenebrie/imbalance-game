import Unit from '@shared/models/Unit'
import { OrderTarget } from '@src/game/models/ServerBoardOrders'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import ServerBuffContainer from './buffs/ServerBuffContainer'
import ServerBoardRow from './ServerBoardRow'
import ServerCard from './ServerCard'
import ServerDamageInstance from './ServerDamageSource'
import ServerGame from './ServerGame'

export default class ServerUnit implements Unit {
	public readonly game: ServerGame
	public readonly card: ServerCard
	public owner: ServerPlayerGroup
	public readonly originalOwner: ServerPlayerInGame

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerGroup, originalOwner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner
		this.originalOwner = originalOwner
	}

	public get boardRow(): ServerBoardRow {
		const row = this.game.board.getRowWithUnit(this)
		if (!row) {
			throw new Error(`Unit ${this.card.class} is not on a board row!`)
		}
		return row
	}

	public get rowIndex(): number {
		return this.game.board.rows.indexOf(this.game.board.getRowWithUnit(this)!)
	}

	public get unitIndex(): number {
		const unitRow = this.game.board.rows[this.rowIndex]
		if (!unitRow) {
			return -1
		}
		return unitRow.cards.indexOf(this)
	}

	public get buffs(): ServerBuffContainer {
		return this.card.buffs
	}

	public dealDamage(damageInstance: ServerDamageInstance): void {
		this.card.dealDamage(damageInstance)
	}

	public heal(healingInstance: ServerDamageInstance): void {
		this.card.heal(healingInstance)
	}

	public isAlive(): boolean {
		return !this.card.isDead
	}

	public isDead(): boolean {
		return this.card.isDead
	}

	public getValidOrders(): OrderTarget[] {
		return this.card.targeting.getOrderTargets(this.game.board.orders.getOrdersPerformedByUnit(this))
	}
}
