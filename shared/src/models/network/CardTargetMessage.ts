import Card from '../Card'
import CardTarget from '../CardTarget'
import TargetMode from '../../enums/TargetMode'
import TargetType from '../../enums/TargetType'
import CardMessage from '../network/CardMessage'

export default class CardTargetMessage {
	targetMode: TargetMode
	targetType: TargetType
	sourceCardId: string
	sourceCardOwnerId: string
	sourceUnitId: string
	targetCardId: string
	targetUnitId: string
	targetRowIndex: number
	targetLabel: string
	targetCardData: CardMessage

	constructor(order: CardTarget) {
		this.targetMode = order.targetMode
		this.targetType = order.targetType
		if (order.sourceCard) {
			this.sourceCardId = order.sourceCard.id
		}
		if (order.sourceCardOwner) {
			this.sourceCardOwnerId = order.sourceCardOwner.player.id
		}
		if (order.sourceUnit) {
			this.sourceUnitId = order.sourceUnit.card.id
		}
		this.targetCardId = ''
		this.targetUnitId = ''
		this.targetRowIndex = -1
		if (order.targetCard) {
			this.targetCardId = order.targetCard.id
		}
		if (order.targetCardData) {
			this.targetCardData = order.targetCardData
		}
		if (order.targetUnit) {
			this.targetUnitId = order.targetUnit.card.id
		}
		if (order.targetRow) {
			this.targetRowIndex = order.targetRow.index
		}
		this.targetLabel = order.targetLabel
	}

	public attachTargetCardData(card: Card): void {
		this.targetCardData = new CardMessage(card)
	}
}
