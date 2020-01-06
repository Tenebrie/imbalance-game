import Card from './Card'
import CardDeckMessage from './network/CardDeckMessage'

export default class CardDeck {
	cards: Card[]

	constructor(cards: Card[]) {
		this.cards = cards
	}

	addCard(card: Card) {
		this.cards.push(card)
	}

	public static fromMessage(message: CardDeckMessage): CardDeck {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new CardDeck(cards)
	}
}
