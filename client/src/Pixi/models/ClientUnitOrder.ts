import UnitOrderType from '../shared/enums/UnitOrderType'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'

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
}
