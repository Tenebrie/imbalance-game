import CardHand from '../../CardHand'
import HiddenCardMessage from '../card/HiddenCardMessage'
import CardHandMessage from './CardHandMessage'

export default class HiddenCardHandMessage implements CardHandMessage {
	unitCards: HiddenCardMessage[]
	spellCards: HiddenCardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map((card) => new HiddenCardMessage(card))
		this.spellCards = cardHand.spellCards.map((card) => new HiddenCardMessage(card))
	}
}
