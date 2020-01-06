import CardMessage from './network/CardMessage'

export default class Card {
	id: string
	cardClass: string

	constructor(id: string, cardClass: string) {
		this.id = id
		this.cardClass = cardClass
	}

	public static fromMessage(message: CardMessage): Card {
		return new Card(message.id, message.cardClass)
	}
}
