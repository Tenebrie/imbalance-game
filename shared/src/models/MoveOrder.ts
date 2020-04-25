import Unit from './Unit'
import BoardRow from './BoardRow'

export default class MoveOrder {
	unit: Unit
	targetRow: BoardRow

	constructor(unit: Unit, targetRow: BoardRow) {
		this.unit = unit
		this.targetRow = targetRow
	}
}
