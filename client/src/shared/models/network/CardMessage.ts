import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'

export default class CardMessage {
	id: string
	cardType: CardType
	cardClass: string

	cardName: string
	cardTitle: string
	cardTribes: CardTribe[]
	cardDescription: string

	power: number
	attack: number
	basePower: number
	baseAttack: number

	constructor(card: Card) {
		this.id = card.id
		this.cardType = card.cardType
		this.cardClass = card.cardClass

		this.cardName = card.cardName
		this.cardTitle = card.cardTitle
		this.cardTribes = card.cardTribes.slice()
		this.cardDescription = card.cardDescription

		this.power = card.power
		this.attack = card.attack
		this.basePower = card.basePower
		this.baseAttack = card.baseAttack
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
