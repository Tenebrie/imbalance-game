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

	drawCard(cardId: string): Card {
		const card = this.cards.find(card => card.id === cardId)
		if (!card) {
			throw new Error(`Trying to draw card with invalid ID: ${cardId}`)
		}

		this.cards.splice(this.cards.indexOf(card), 1)
		return card
	}

	public static fromMessage(message: CardDeckMessage): CardDeck {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new CardDeck(cards)
	}
}
