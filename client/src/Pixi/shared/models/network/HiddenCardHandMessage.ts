import Card from '../Card'
import CardHand from '../CardHand'
import HiddenCardMessage from './HiddenCardMessage'

export default class HiddenCardHandMessage {
	cards: HiddenCardMessage[]

	constructor(cards: Card[]) {
		this.cards = cards.map(card => HiddenCardMessage.fromCard(card))
	}

	public static fromHand(cardHand: CardHand): HiddenCardHandMessage {
		return new HiddenCardHandMessage(cardHand.cards)
	}
}
