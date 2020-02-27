import CardHand from '../CardHand'
import HiddenCardMessage from './HiddenCardMessage'

export default class HiddenCardHandMessage {
	unitCards: HiddenCardMessage[]
	spellCards: HiddenCardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map(card => new HiddenCardMessage(card))
		this.spellCards = cardHand.spellCards.map(card => new HiddenCardMessage(card))
	}
}
