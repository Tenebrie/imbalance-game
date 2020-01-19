import UnitOrderType from '../shared/enums/UnitOrderType'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerGameBoardRow from './ServerGameBoardRow'

export default class ServerUnitOrder {
	type: UnitOrderType
	orderedUnit: ServerCardOnBoard
	targetUnit?: ServerCardOnBoard
	targetRow?: ServerGameBoardRow

	public isEqual(other: ServerUnitOrder): boolean {
		return this.type === other.type && this.orderedUnit === other.orderedUnit && this.targetUnit === other.targetUnit && this.targetRow === other.targetRow
	}

	public static attack(orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): ServerUnitOrder {
		const order = new ServerUnitOrder()
		order.type = UnitOrderType.ATTACK
		order.orderedUnit = orderedUnit
		order.targetUnit = targetUnit
		return order
	}

	public static move(orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): ServerUnitOrder {
		const order = new ServerUnitOrder()
		order.type = UnitOrderType.MOVE
		order.orderedUnit = orderedUnit
		order.targetRow = targetRow
		return order
	}
}
