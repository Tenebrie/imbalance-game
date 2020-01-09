import Card from '../Card'
import CardType from '../../enums/CardType'

export default class CardMessage {
	id: string
	cardType: CardType
	cardClass: string

	attack: number
	health: number
	initiative: number

	constructor(card: Card) {
		this.id = card.id
		this.cardType = card.cardType
		this.cardClass = card.cardClass
		this.attack = card.attack
		this.health = card.health
		this.initiative = card.initiative
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
