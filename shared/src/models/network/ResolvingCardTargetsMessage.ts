import TargetMode from '../../enums/TargetMode'
import CardTarget from '../CardTarget'
import CardTargetMessage from './CardTargetMessage'
import CardRefMessage from './card/CardRefMessage'
import Card from '../Card'

export default class ResolvingCardTargetsMessage {
	targetMode: TargetMode
	targets: CardTargetMessage[]
	source: CardRefMessage | null

	public constructor(targetMode: TargetMode, targets: CardTarget[], source: Card | null) {
		const messages = targets.map((target) => new CardTargetMessage(target))

		this.targetMode = targetMode
		this.targets = messages
		this.source = source ? new CardRefMessage(source) : null
	}
}
