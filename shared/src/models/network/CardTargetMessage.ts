import CardTarget from '../CardTarget'
import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'
import OpenCardMessage from './card/OpenCardMessage'

export default class CardTargetMessage {
	targetMode: TargetMode
	targetType: TargetType
	sourceCardId: string
	targetCardId: string
	targetRowIndex: number
	targetLabel: string
	targetCardData: OpenCardMessage | null

	constructor(order: CardTarget) {
		this.targetMode = order.targetMode
		this.targetType = order.targetType
		this.sourceCardId = order.sourceCardId
		this.targetCardId = ''
		if ('targetCardId' in order) {
			this.targetCardId = order.targetCardId
		} else {
			this.targetCardId = ''
		}
		if ('targetCardData' in order) {
			this.targetCardData = order.targetCardData
		} else {
			this.targetCardData = null
		}
		if ('targetRow' in order) {
			this.targetRowIndex = order.targetRow.index
		} else {
			this.targetRowIndex = -1
		}
		this.targetLabel = order.targetLabel
	}
}
