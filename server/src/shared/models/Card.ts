import CardType from '../enums/CardType'
import CardMessage from './network/CardMessage'

export default class Card {
	id: string
	cardType: CardType
	cardClass: string

	attack = 0
	health = 0
	initiative = 0

	baseAttack = 0
	baseHealth = 0
	baseInitiative = 0

	constructor(id: string, cardType: CardType, cardClass: string) {
		this.id = id
		this.cardType = cardType
		this.cardClass = cardClass
	}

	public static fromMessage(message: CardMessage): Card {
		return new Card(message.id, message.cardType, message.cardClass)
	}
}
