import Card from '../Card'
import CardDeck from '../CardDeck'
import CardMessage from './CardMessage'

export default class CardDeckMessage extends CardDeck {
	cards: CardMessage[]

	constructor(cards: Card[]) {
		super(cards)
		this.cards = cards.map(card => CardMessage.fromCard(card))
	}

	public static fromDeck(cardDeck: CardDeck): CardDeckMessage {
		return new CardDeckMessage(cardDeck.cards)
	}
}
