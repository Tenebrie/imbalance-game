import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'
import AnonymousTarget from '../AnonymousTarget'
import OpenCardMessage from './card/OpenCardMessage'

export default class AnonymousTargetMessage {
	targetMode: TargetMode
	targetType: TargetType
	targetCardId: string
	targetRowIndex: number
	targetLabel: string
	targetCardData: OpenCardMessage | null

	constructor(order: AnonymousTarget) {
		this.targetMode = order.targetMode
		this.targetType = order.targetType
		if ('targetCard' in order) {
			this.targetCardId = order.targetCard.id
		} else {
			this.targetCardId = ''
		}
		this.targetRowIndex = -1
		this.targetCardData = new OpenCardMessage(order.targetCard)
		this.targetLabel = order.targetLabel
	}
}
