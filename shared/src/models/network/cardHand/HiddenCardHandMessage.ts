import CardHand from '../../CardHand'
import CardHandMessage from './CardHandMessage'
import HiddenCardMessage from '../card/HiddenCardMessage'

export default class HiddenCardHandMessage implements CardHandMessage {
	unitCards: HiddenCardMessage[]
	spellCards: HiddenCardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map((card) => new HiddenCardMessage(card))
		this.spellCards = cardHand.spellCards.map((card) => new HiddenCardMessage(card))
	}
}
