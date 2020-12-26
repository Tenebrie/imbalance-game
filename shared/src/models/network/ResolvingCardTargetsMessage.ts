import TargetMode from '../../enums/TargetMode'
import CardTarget from '../CardTarget'
import CardTargetMessage from './CardTargetMessage'
import CardRefMessage from './card/CardRefMessage'
import Card from '../Card'

export default class ResolvingCardTargetsMessage {
	targetMode: TargetMode
	targets: CardTargetMessage[]
	source: CardRefMessage

	public constructor(targetMode: TargetMode, targets: CardTarget[], source: Card) {
		const messages = targets.map((target) => new CardTargetMessage(target))

		this.targetMode = targetMode
		this.targets = messages
		this.source = new CardRefMessage(source)
	}
}
