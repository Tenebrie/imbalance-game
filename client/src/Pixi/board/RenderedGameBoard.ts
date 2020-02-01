import Constants from '@/Pixi/shared/Constants'
import GameBoard from '@/Pixi/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import ClientUnitOrder from '@/Pixi/models/ClientUnitOrder'
import Core from '@/Pixi/Core'

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	unitsOnHold: RenderedCardOnBoard[]
	isInverted = false
	validOrders: ClientUnitOrder[]
	validOpponentOrders: ClientUnitOrder[]

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

	public insertUnit(unit: RenderedCardOnBoard, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertUnit(unit, unitIndex)
	}

	public removeUnit(unit: RenderedCardOnBoard): void {
		this.rows[unit.rowIndex].removeUnit(unit)
	}

	public insertUnitFromHold(unitId: string, rowIndex: number, unitIndex: number): void {
		const unit = this.unitsOnHold.find(unit => unit.card.id === unitId)
		if (!unit) { return }

		this.unitsOnHold.splice(this.unitsOnHold.indexOf(unit), 1)
		this.insertUnit(unit, rowIndex, unitIndex)
	}

	public findUnitById(unitId: string): RenderedCardOnBoard | null {
		const cards = this.getAllCards()
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
		return this.rows.map(row => row.cards).flat().concat(this.unitsOnHold)
	}

	public getCardsOwnedByPlayer(owner: ClientPlayerInGame) {
		return this.getAllCards().filter(unit => unit.owner === owner)
	}

	public getValidOrdersForUnit(unit: RenderedCardOnBoard): ClientUnitOrder[] {
		return this.validOrders.concat(this.validOpponentOrders).filter(order => order.orderedUnit === unit)
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
