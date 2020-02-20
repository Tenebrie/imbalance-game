import CardHand from '../CardHand'
import CardMessage from './CardMessage'

export default class CardHandMessage implements CardHand {
	unitCards: CardMessage[]
	spellCards: CardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map(card => new CardMessage(card))
		this.spellCards = cardHand.spellCards.map(card => new CardMessage(card))
	}
}
