import Constants from '@/shared/Constants'
import GameBoard from '@/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import Point = PIXI.Point

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	isInverted: boolean = false

	constructor() {
		super()
		this.rows = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new RenderedGameBoardRow())
		}
	}

	public insertCard(card: RenderedCardOnBoard, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertCard(card, unitIndex)
	}

	public isHovered(mousePosition: Point): boolean {
		return this.rows.some(row => row.isHovered(mousePosition))
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
