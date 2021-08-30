import CardHand from '../../CardHand'
import OpenCardMessage from '../card/OpenCardMessage'
import CardHandMessage from './CardHandMessage'

export default class OpenCardHandMessage implements CardHandMessage {
	unitCards: OpenCardMessage[]
	spellCards: OpenCardMessage[]

	constructor(cardHand: CardHand) {
		this.unitCards = cardHand.unitCards.map((card) => new OpenCardMessage(card))
		this.spellCards = cardHand.spellCards.map((card) => new OpenCardMessage(card))
	}
}
