import CardDeck from '../../CardDeck'
import OpenCardMessage from '../card/OpenCardMessage'
import CardDeckMessage from './CardDeckMessage'

export default class OpenCardDeckMessage implements CardDeckMessage {
	unitCards: OpenCardMessage[]
	spellCards: OpenCardMessage[]

	constructor(deck: CardDeck) {
		this.unitCards = deck.unitCards.map((card) => new OpenCardMessage(card))
		this.spellCards = deck.spellCards.map((card) => new OpenCardMessage(card))
	}
}
