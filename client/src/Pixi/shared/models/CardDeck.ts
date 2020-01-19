import Card from './Card'

export default class CardDeck {
	cards: Card[]

	constructor(cards: Card[]) {
		this.cards = cards
	}
}
