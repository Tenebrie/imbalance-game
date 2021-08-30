import CardDeck from '../../CardDeck'
import HiddenCardMessage from '../card/HiddenCardMessage'
import CardDeckMessage from './CardDeckMessage'

export default class HiddenCardDeckMessage implements CardDeckMessage {
	unitCards: HiddenCardMessage[]
	spellCards: HiddenCardMessage[]

	constructor(cardDeck: CardDeck) {
		this.unitCards = cardDeck.unitCards.map((card) => new HiddenCardMessage(card))
		this.spellCards = cardDeck.spellCards.map((card) => new HiddenCardMessage(card))
	}
}
