import Constants from '@/Pixi/shared/Constants'
import GameBoard from '@/Pixi/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import RenderedAttackOrder from '@/Pixi/models/RenderedAttackOrder'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	isInverted = false
	queuedAttacks: RenderedAttackOrder[]

	constructor() {
		super()
		this.rows = []
		this.queuedAttacks = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new RenderedGameBoardRow(i))
		}
	}

	public insertUnit(card: RenderedCardOnBoard, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertUnit(card, unitIndex)
	}

	public removeUnit(unit: RenderedCardOnBoard): void {
		this.rows[unit.rowIndex].removeUnit(unit)
	}

	public findUnitById(unitId: string): RenderedCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === unitId) || null
	}

	public destroyUnit(unit: RenderedCardOnBoard): void {
		const currentRow = this.getRowWithCard(unit)
		if (!currentRow) { return }

		currentRow.destroyUnit(unit)
	}

	public getRowWithCard(targetUnit: RenderedCardOnBoard): RenderedGameBoardRow | null {
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null
	}

	public getAllCards(): RenderedCardOnBoard[] {
		return this.rows.map(row => row.cards).flat()
	}

	public getCardsOwnedByPlayer(owner: ClientPlayerInGame) {
		return this.getAllCards().filter(unit => unit.owner === owner)
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public updateUnitOrders(newOrders: RenderedAttackOrder[], removedOrders: RenderedAttackOrder[]): void {
		removedOrders.forEach(queuedAttack => {
			queuedAttack.destroy()
		})
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => !removedOrders.includes(queuedAttack))
		this.queuedAttacks = this.queuedAttacks.concat(newOrders)
		newOrders.forEach(newAttack => {
			newAttack.attacker.preferredAttackTarget = newAttack.target
		})
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
