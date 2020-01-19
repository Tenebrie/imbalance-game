import UnitOrderType from '../../enums/UnitOrderType'
import UnitOrder from '../UnitOrder'

export default class UnitOrderMessage {
	type: UnitOrderType
	orderedUnitId: string
	targetUnitId: string
	targetRowIndex: number

	constructor(order: UnitOrder) {
		this.type = order.type
		this.orderedUnitId = order.orderedUnit.card.id
		this.targetUnitId = ''
		this.targetRowIndex = -1
		if (this.type === UnitOrderType.ATTACK) {
			this.targetUnitId = order.targetUnit!.card.id
		} else if (this.type === UnitOrderType.MOVE) {
			this.targetRowIndex = order.targetRow!.index
		}
	}
}
