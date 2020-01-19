import Card from './Card'

export default class CardHand {
	cards: Card[] = []

	constructor(cards: Card[]) {
		this.cards = cards
	}
}
