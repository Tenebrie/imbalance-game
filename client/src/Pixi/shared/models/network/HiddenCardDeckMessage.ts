import Card from '../Card'
import CardDeck from '../CardDeck'
import HiddenCardMessage from './HiddenCardMessage'

export default class HiddenCardDeckMessage {
	cards: HiddenCardMessage[]

	constructor(cards: Card[]) {
		this.cards = cards.map(card => HiddenCardMessage.fromCard(card))
	}

	public static fromDeck(cardDeck: CardDeck): HiddenCardDeckMessage {
		return new HiddenCardDeckMessage(cardDeck.cards)
	}
}
