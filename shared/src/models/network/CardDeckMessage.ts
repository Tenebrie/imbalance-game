import CardDeck from '../CardDeck'
import CardMessage from './CardMessage'

export default class CardDeckMessage {
	unitCards: CardMessage[]
	spellCards: CardMessage[]

	constructor(deck: CardDeck) {
		this.unitCards = deck.unitCards.map(card => CardMessage.fromCard(card))
		this.spellCards = deck.spellCards.map(card => CardMessage.fromCard(card))
	}
}
