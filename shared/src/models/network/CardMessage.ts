import Card from '../Card'
import CardType from '../../enums/CardType'

export default class CardMessage {
	id: string
	cardType: CardType
	cardClass: string

	power: number
	attack: number
	basePower: number
	baseAttack: number

	constructor(card: Card) {
		this.id = card.id
		this.cardType = card.cardType
		this.cardClass = card.cardClass
		this.power = card.power
		this.attack = card.attack
		this.basePower = card.basePower
		this.baseAttack = card.baseAttack
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
