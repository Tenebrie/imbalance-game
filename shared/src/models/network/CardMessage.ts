import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import UnitSubtype from '../../enums/UnitSubtype'
import RichTextVariables from '../RichTextVariables'

export default class CardMessage {
	id: string
	cardType: CardType
	cardClass: string
	unitSubtype: UnitSubtype | null

	cardName: string
	cardTitle: string
	cardTribes: CardTribe[]
	cardDescription: string
	cardTextVariables: RichTextVariables

	power: number
	attack: number
	attackRange: number
	healthArmor: number

	basePower: number
	baseAttack: number
	baseAttackRange: number
	baseHealthArmor: number

	constructor(card: Card) {
		this.id = card.id
		this.cardType = card.cardType
		this.cardClass = card.cardClass
		this.unitSubtype = card.unitSubtype

		this.cardName = card.cardName
		this.cardTitle = card.cardTitle
		this.cardTribes = card.cardTribes.slice()
		this.cardDescription = card.cardDescription
		this.cardTextVariables = card.cardTextVariables

		this.power = card.power
		this.attack = card.attack
		this.attackRange = card.attackRange
		this.healthArmor = card.healthArmor

		this.basePower = card.basePower
		this.baseAttack = card.baseAttack
		this.baseAttackRange = card.baseAttackRange
		this.baseHealthArmor = card.baseHealthArmor
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}
}
