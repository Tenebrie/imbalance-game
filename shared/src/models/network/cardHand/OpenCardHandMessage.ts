import CardHand from '../../CardHand'
import CardHandMessage from './CardHandMessage'
import OpenCardMessage from '../card/OpenCardMessage'

export default class OpenCardHandMessage implements CardHandMessage {
	unitCards: OpenCardMessage[]
	spellCards: OpenCardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map((card) => new OpenCardMessage(card))
		this.spellCards = cardHand.spellCards.map((card) => new OpenCardMessage(card))
	}
}
