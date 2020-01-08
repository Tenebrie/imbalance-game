import Card from '../Card'
import CardType from '../../enums/CardType'

export default class CardMessage {
	id: string
	cardType: CardType
	cardClass: string

	constructor(card: Card) {
		this.id = card.id
		this.cardType = card.cardType
		this.cardClass = card.cardClass
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
