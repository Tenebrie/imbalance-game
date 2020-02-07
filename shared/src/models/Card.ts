import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import UnitSubtype from '../enums/UnitSubtype'
import RichTextVariables from './RichTextVariables'

export default class Card {
	id: string
	cardType: CardType
	cardClass: string
	unitSubtype: UnitSubtype | null

	cardName: string
	cardTitle: string
	cardTribes: CardTribe[]
	cardDescription: string
	cardTextVariables: RichTextVariables

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
		this.unitSubtype = null

		this.cardName = ''
		this.cardTitle = ''
		this.cardTribes = []
		this.cardDescription = ''
		this.cardTextVariables = {}
	}
}
