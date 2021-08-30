import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'
import CardTarget from '../CardTarget'
import OpenCardMessage from './card/OpenCardMessage'

export default class CardTargetMessage {
	id: string
	targetMode: TargetMode
	targetType: TargetType
	sourceCardId: string
	targetCardId: string
	targetRowIndex: number
	targetPosition: number
	targetLabel: string
	targetCardData: OpenCardMessage | null

	constructor(order: CardTarget) {
		this.id = order.id
		this.targetMode = order.targetMode
		this.targetType = order.targetType
		this.sourceCardId = order.sourceCard.id
		if (order.targetType === TargetType.BOARD_ROW) {
			this.targetCardId = ''
			this.targetRowIndex = order.targetRow.index
			this.targetPosition = -1
		} else if (order.targetType === TargetType.BOARD_POSITION) {
			this.targetCardId = ''
			this.targetRowIndex = order.targetRow.index
			this.targetPosition = order.targetPosition
		} else {
			this.targetCardId = order.targetCard.id
			this.targetRowIndex = -1
			this.targetPosition = -1
		}

		if (
			order.targetType !== TargetType.UNIT &&
			order.targetType !== TargetType.BOARD_ROW &&
			order.targetType !== TargetType.BOARD_POSITION
		) {
			this.targetCardData = new OpenCardMessage(order.targetCard)
		} else {
			this.targetCardData = null
		}
		this.targetLabel = order.targetLabel
	}
}
