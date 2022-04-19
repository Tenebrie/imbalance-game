import Unit from '@shared/models/Unit'
import { OrderTarget } from '@src/game/models/ServerBoardOrders'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'

import ServerBuffContainer, { ServerBuffSource } from './buffs/ServerBuffContainer'
import ServerBoardRow from './ServerBoardRow'
import ServerCard from './ServerCard'
import ServerCardStats from './ServerCardStats'
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

	public get stats(): ServerCardStats {
		return this.card.stats
	}

	public get isBronzeOrSilver(): boolean {
		return this.card.isBronzeOrSilver
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

	public boost(value: number | LeaderStatValueGetter, source: ServerBuffSource, animation: 'sync' | 'stagger' | 'parallel' = 'sync'): void {
		this.card.boost(value, source, animation)
	}

	public strengthen(
		value: number | LeaderStatValueGetter,
		source: ServerBuffSource,
		animation: 'sync' | 'stagger' | 'parallel' = 'sync'
	): void {
		this.card.strengthen(value, source, animation)
	}

	public weaken(
		value: number | LeaderStatValueGetter,
		source: ServerBuffSource,
		animation: 'sync' | 'stagger' | 'parallel' = 'sync'
	): void {
		this.card.weaken(value, source, animation)
	}

	public dealDamage(damageInstance: ServerDamageInstance, animation: 'sync' | 'stagger' | 'parallel' = 'sync'): void {
		this.card.dealDamage(damageInstance, animation)
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
