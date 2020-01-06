import Card from '../Card'

export default class CardMessage {
	id: string
	cardClass: string

	constructor(card: Card) {
		this.id = card.id
		this.cardClass = card.cardClass
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
