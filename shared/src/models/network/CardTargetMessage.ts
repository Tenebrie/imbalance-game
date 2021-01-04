import CardTarget from '../CardTarget'
import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'
import OpenCardMessage from './card/OpenCardMessage'

export default class CardTargetMessage {
	id: string
	targetMode: TargetMode
	targetType: TargetType
	sourceCardId: string
	targetCardId: string
	targetRowIndex: number
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
		} else {
			this.targetCardId = order.targetCard.id
			this.targetRowIndex = -1
		}

		if (order.targetType !== TargetType.UNIT && order.targetType !== TargetType.BOARD_ROW) {
			this.targetCardData = new OpenCardMessage(order.targetCard)
		} else {
			this.targetCardData = null
		}
		this.targetLabel = order.targetLabel
	}
}
