import ServerCardOnBoard from './ServerCardOnBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import UnitOrder from '../shared/models/UnitOrder'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'
import UnitOrderMessage from '../shared/models/network/UnitOrderMessage'
import ServerGame from './ServerGame'

export default class ServerUnitOrder implements UnitOrder {
	targetMode: TargetMode
	targetType: TargetType
	orderedUnit: ServerCardOnBoard
	targetUnit?: ServerCardOnBoard
	targetRow?: ServerGameBoardRow
	targetLabel: string

	private constructor(targetMode: TargetMode, targetType: TargetType, orderedUnit: ServerCardOnBoard) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.orderedUnit = orderedUnit
	}

	public isEqual(other: ServerUnitOrder): boolean {
		return this.targetMode === other.targetMode && this.targetType === other.targetType && this.orderedUnit === other.orderedUnit && this.targetUnit === other.targetUnit && this.targetRow === other.targetRow
	}

	public static targetUnit(targetMode: TargetMode, orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard, targetLabel: string = ''): ServerUnitOrder {
		const order = new ServerUnitOrder(targetMode, TargetType.UNIT, orderedUnit)
		order.targetUnit = targetUnit
		order.targetLabel = targetLabel
		return order
	}

	public static targetRow(targetMode: TargetMode, orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow, targetLabel: string = ''): ServerUnitOrder {
		const order = new ServerUnitOrder(targetMode, TargetType.BOARD_ROW, orderedUnit)
		order.targetRow = targetRow
		order.targetLabel = targetLabel
		return order
	}

	public static fromMessage(game: ServerGame, message: UnitOrderMessage): ServerUnitOrder {
		const orderedUnit = game.board.findUnitById(message.orderedUnitId)
		const order = new ServerUnitOrder(message.targetMode, message.targetType, orderedUnit)
		if (message.targetType === TargetType.UNIT) {
			order.targetUnit = game.board.findUnitById(message.targetUnitId)
		} else if (message.targetType === TargetType.BOARD_ROW) {
			order.targetRow = game.board.rows[message.targetRowIndex]
		}
		order.targetLabel = message.targetLabel
		return order
	}
}
