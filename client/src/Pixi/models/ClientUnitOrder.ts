import UnitOrderType from '../shared/enums/UnitOrderType'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import Core from '@/Pixi/Core'

export default class ClientUnitOrder implements UnitOrder {
	type: UnitOrderType
	orderedUnit: RenderedCardOnBoard
	targetUnit?: RenderedCardOnBoard
	targetRow?: RenderedGameBoardRow

	constructor(type: UnitOrderType, orderedUnit: RenderedCardOnBoard) {
		this.type = type
		this.orderedUnit = orderedUnit
	}

	public static attack(orderedUnit: RenderedCardOnBoard, targetUnit: RenderedCardOnBoard): ClientUnitOrder {
		const order = new ClientUnitOrder(UnitOrderType.ATTACK, orderedUnit)
		order.targetUnit = targetUnit
		return order
	}

	public static move(orderedUnit: RenderedCardOnBoard, targetRow: RenderedGameBoardRow): ClientUnitOrder {
		const order = new ClientUnitOrder(UnitOrderType.MOVE, orderedUnit)
		order.targetRow = targetRow
		return order
	}

	public static fromMessage(message: UnitOrderMessage): ClientUnitOrder {
		const orderedUnit = Core.board.findUnitById(message.orderedUnitId)
		const order = new ClientUnitOrder(message.type, orderedUnit)
		if (message.type === UnitOrderType.ATTACK) {
			order.targetUnit = Core.board.findUnitById(message.targetUnitId)
		} else if (message.type === UnitOrderType.MOVE) {
			order.targetRow = Core.board.rows[message.targetRowIndex]
		}
		return order
	}
}
