import CardType from '../enums/CardType'
import CardMessage from './network/CardMessage'
import CardTribe from '../enums/CardTribe'

export default class Card {
	id: string
	cardType: CardType
	cardClass: string

	cardName: string
	cardTitle: string
	cardTribes: CardTribe[]
	cardDescription: string

	power = 0
	attack = 0
	attackRange = 1
	healthArmor = 0

	basePower = 0
	baseAttack = 0
	baseAttackRange = 1
	baseHealthArmor = 0

	constructor(id: string, cardType: CardType, cardClass: string) {
		this.id = id
		this.cardType = cardType
		this.cardClass = cardClass

		this.cardName = ''
		this.cardTitle = ''
		this.cardTribes = []
		this.cardDescription = ''
	}

	public static fromMessage(message: CardMessage): Card {
		const card = new Card(message.id, message.cardType, message.cardClass)

		card.cardName = message.cardName
		card.cardTitle = message.cardTitle
		card.cardTribes = message.cardTribes.slice()
		card.cardDescription = message.cardDescription

		card.power = message.power
		card.attack = message.attack
		card.basePower = message.basePower
		card.baseAttack = message.baseAttack
		return card
	}
}
