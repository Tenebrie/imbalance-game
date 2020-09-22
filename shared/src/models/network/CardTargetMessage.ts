import Card from '../Card'
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
		this.sourceCardId = order.sourceCard ? order.sourceCard.id : ''
		this.targetCardId = ''
		this.targetRowIndex = -1
		if (order.targetCard) {
			this.targetCardId = order.targetCard.id
		}
		if (order.targetCardData) {
			this.targetCardData = order.targetCardData
		}
		if (order.targetRow) {
			this.targetRowIndex = order.targetRow.index
		}
		this.targetLabel = order.targetLabel
		this.targetCardData = null
	}

	public attachTargetCardData(card: Card): void {
		this.targetCardData = new OpenCardMessage(card)
	}
}
