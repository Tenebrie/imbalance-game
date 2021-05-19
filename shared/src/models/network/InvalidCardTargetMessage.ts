import TargetMode from '../../enums/TargetMode'
import CardRefMessage from './card/CardRefMessage'
import Card from '../Card'

export default class InvalidCardTargetMessage {
	targetMode: TargetMode
	source: CardRefMessage

	public constructor(targetMode: TargetMode, source: Card) {
		this.targetMode = targetMode
		this.source = new CardRefMessage(source)
	}
}
