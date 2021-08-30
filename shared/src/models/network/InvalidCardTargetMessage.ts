import TargetMode from '../../enums/TargetMode'
import Card from '../Card'
import CardRefMessage from './card/CardRefMessage'

export default class InvalidCardTargetMessage {
	targetMode: TargetMode
	source: CardRefMessage

	public constructor(targetMode: TargetMode, source: Card) {
		this.targetMode = targetMode
		this.source = new CardRefMessage(source)
	}
}
