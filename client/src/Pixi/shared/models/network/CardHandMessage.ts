import Card from '../Card'
import CardHand from '../CardHand'
import CardMessage from './CardMessage'

export default class CardHandMessage {
	cards: CardMessage[]

	constructor(cards: Card[]) {
		this.cards = cards.map(card => CardMessage.fromCard(card))
	}

	public static fromHand(cardHand: CardHand): CardHandMessage {
		return new CardHandMessage(cardHand.cards)
	}
}
