import CardType from '../enums/CardType'
import CardMessage from './network/CardMessage'

export default class Card {
	id: string
	cardType: CardType
	cardClass: string

	power = 0
	attack = 0

	basePower = 0
	baseAttack = 0

	constructor(id: string, cardType: CardType, cardClass: string) {
		this.id = id
		this.cardType = cardType
		this.cardClass = cardClass
	}

	public static fromMessage(message: CardMessage): Card {
		const card = new Card(message.id, message.cardType, message.cardClass)
		card.power = message.power
		card.attack = message.attack
		card.basePower = message.basePower
		card.baseAttack = message.baseAttack
		return card
	}
}
