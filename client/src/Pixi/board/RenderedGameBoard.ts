import Constants from '@shared/Constants'
import Board from '@shared/models/Board'
import RenderedUnit from '@/Pixi/board/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import Core from '@/Pixi/Core'

export default class RenderedGameBoard extends Board {
	rows: RenderedGameBoardRow[]
	unitsOnHold: RenderedUnit[]
	isInverted = false
	validOrders: ClientCardTarget[]
	validOpponentOrders: ClientCardTarget[]

	constructor() {
		super()
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

	public getUnitsOwnedByPlayer(owner: ClientPlayerInGame) {
		return this.getAllUnits().filter(unit => unit.owner === owner)
	}

	public getValidOrdersForUnit(unit: RenderedUnit): ClientCardTarget[] {
		return this.validOrders.concat(this.validOpponentOrders).filter(order => order.sourceUnit === unit)
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
