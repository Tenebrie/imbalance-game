import Card from '../Card'
import CardType from '../../enums/CardType'

export default class HiddenCardMessage {
	id: string
	cardType: CardType
	cardClass: string

	constructor(card: Card) {
		this.id = card.id
		this.cardType = CardType.HIDDEN
		this.cardClass = 'cardBack'
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
