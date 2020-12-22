import CardDeck from '../../CardDeck'
import CardDeckMessage from './CardDeckMessage'
import OpenCardMessage from '../card/OpenCardMessage'

export default class OpenCardDeckMessage implements CardDeckMessage {
	unitCards: OpenCardMessage[]
	spellCards: OpenCardMessage[]

	constructor(deck: CardDeck) {
		this.unitCards = deck.unitCards.map((card) => new OpenCardMessage(card))
		this.spellCards = deck.spellCards.map((card) => new OpenCardMessage(card))
	}
}
