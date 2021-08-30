import TargetMode from '../../enums/TargetMode'
import Card from '../Card'
import CardTarget from '../CardTarget'
import CardRefMessage from './card/CardRefMessage'
import CardTargetMessage from './CardTargetMessage'

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
