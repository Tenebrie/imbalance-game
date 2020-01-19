import CardOnBoard from './CardOnBoard'
import GameBoardRow from './GameBoardRow'

export default class MoveOrder {
	unit: CardOnBoard
	targetRow: GameBoardRow

	constructor(unit: CardOnBoard, targetRow: GameBoardRow) {
		this.unit = unit
		this.targetRow = targetRow
	}
}
