import { Card } from "./Card"

export default class Deck {
	cards: Card[]

	addCard(card: Card) {
		this.cards.push(card)
	}
}
