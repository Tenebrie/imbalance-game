import Card from '../Card'

export default class CardPlayedMessage {
	id: string
	cardClass: string

	constructor(card: Card) {
		this.id = card.id
		this.cardClass = card.cardClass
	}

	static fromCard(card: Card): CardPlayedMessage {
		return new CardPlayedMessage(card)
	}
}
