import Constants from '@shared/Constants'
import Board from '@shared/models/Board'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'

export default class RenderedGameBoard implements Board {
	public rows: RenderedGameBoardRow[]
	public unitsOnHold: RenderedUnit[]
	public isInverted = false
	public validOrders: ClientCardTarget[]
	public validOpponentOrders: ClientCardTarget[]

	public constructor() {
		this.rows = []
		this.unitsOnHold = []
		this.validOrders = []
		this.validOpponentOrders = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new RenderedGameBoardRow(i))
		}
	}

	public insertUnit(unit: RenderedUnit, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertUnit(unit, unitIndex)
	}

	public removeUnit(unit: RenderedUnit): void {
		this.rows[unit.rowIndex].removeUnit(unit)
	}

	public insertUnitFromHold(unitId: string, rowIndex: number, unitIndex: number): void {
		const unit = this.unitsOnHold.find(unit => unit.card.id === unitId)
		if (!unit) { return }

		this.unitsOnHold.splice(this.unitsOnHold.indexOf(unit), 1)
		this.insertUnit(unit, rowIndex, unitIndex)
	}

	public findUnitById(unitId: string): RenderedUnit | null {
		const cards = this.getAllUnits()
		return cards.find(cardOnBoard => cardOnBoard.card.id === unitId) || null
	}

	public findInsertedById(unitId: string): RenderedUnit | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === unitId) || null
	}

	public destroyUnit(unit: RenderedUnit): void {
		const currentRow = this.getRowWithCard(unit)
		if (!currentRow) { return }

		currentRow.destroyUnit(unit)
	}

	public getRowWithCard(targetUnit: RenderedUnit): RenderedGameBoardRow | null {
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null
	}

	public getAllUnits(): RenderedUnit[] {
		return this.rows.map(row => row.cards).flat().concat(this.unitsOnHold)
	}

	public getUnitsOwnedByPlayer(owner: ClientPlayerInGame): RenderedUnit[] {
		return this.getAllUnits().filter(unit => unit.owner === owner)
	}

	public getValidOrdersForUnit(unit: RenderedUnit): ClientCardTarget[] {
		return this.validOrders.concat(this.validOpponentOrders).filter(order => order.sourceCard === unit.card)
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
