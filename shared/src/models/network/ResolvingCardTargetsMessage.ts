import TargetMode from '../../enums/TargetMode'
import CardTarget from '../CardTarget'
import CardTargetMessage from './CardTargetMessage'
import TargetType from '../../enums/TargetType'
import OpenCardMessage from './card/OpenCardMessage'

export default class ResolvingCardTargetsMessage {
	targetMode: TargetMode
	targets: CardTargetMessage[]

	public constructor(targetMode: TargetMode, targets: CardTarget[]) {
		const messages = targets.map(target => {
			const message = new CardTargetMessage(target)
			if (target.targetCard && !(target.targetCard instanceof OpenCardMessage) &&
				(target.targetType === TargetType.CARD_IN_LIBRARY || target.targetType === TargetType.CARD_IN_UNIT_DECK || target.targetType === TargetType.CARD_IN_SPELL_DECK)) {
				message.attachTargetCardData(target.targetCard)
			}
			return message
		})

		this.targetMode = targetMode
		this.targets = messages
	}
}
