import UnitOrder from '../UnitOrder'
import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'

export default class UnitOrderMessage {
	targetMode: TargetMode
	targetType: TargetType
	orderedUnitId: string
	targetUnitId: string
	targetRowIndex: number
	targetLabel: string

	constructor(order: UnitOrder) {
		this.targetMode = order.targetMode
		this.targetType = order.targetType
		this.orderedUnitId = order.orderedUnit.card.id
		this.targetUnitId = ''
		this.targetRowIndex = -1
		if (this.targetType === TargetType.UNIT) {
			this.targetUnitId = order.targetUnit!.card.id
		} else if (this.targetType === TargetType.BOARD_ROW) {
			this.targetRowIndex = order.targetRow!.index
		}
		this.targetLabel = order.targetLabel
	}
}
