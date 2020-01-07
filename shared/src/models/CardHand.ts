import Card from './Card'
import CardHandMessage from './network/CardHandMessage'

export default class CardHand {
	cards: Card[] = []

	constructor(cards: Card[]) {
		this.cards = cards
	}

	public static fromMessage(message: CardHandMessage): CardHand {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new CardHand(cards)
	}
}
