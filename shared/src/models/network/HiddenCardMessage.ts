import Card from '../Card'

export default class HiddenCardMessage {
	id: string
	cardClass: string

	constructor(card: Card) {
		this.id = card.id
		this.cardClass = 'sw-спойлераст'
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
