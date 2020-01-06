import Card from './Card'
import CardHandMessage from './network/CardHandMessage'
import CardMessage from './network/CardMessage'

export default class CardHand {
	cards: Card[] = []

	constructor(cards: Card[]) {
		this.cards = cards
	}

	addCard(card: Card) {
		this.cards.push(card)
	}

	public static fromMessage(message: CardHandMessage): CardHand {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new CardHand(cards)
	}
}
