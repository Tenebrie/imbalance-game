import CardDeck from '../CardDeck'
import HiddenCardMessage from './HiddenCardMessage'

export default class HiddenCardDeckMessage {
	unitCards: HiddenCardMessage[]
	spellCards: HiddenCardMessage[]

	constructor(cardDeck: CardDeck) {
		this.unitCards = cardDeck.unitCards.map(card => HiddenCardMessage.fromCard(card))
		this.spellCards = cardDeck.spellCards.map(card => HiddenCardMessage.fromCard(card))
	}
}
