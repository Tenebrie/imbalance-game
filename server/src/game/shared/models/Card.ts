import CardBuffs from './CardBuffs'
import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import UnitSubtype from '../enums/CardColor'
import RichTextVariables from './RichTextVariables'

export default class Card {
	id: string
	cardType: CardType
	cardClass: string
	unitSubtype: UnitSubtype | null

	cardName: string
	cardTitle: string
	cardBuffs: CardBuffs
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
		this.unitSubtype = null

		this.cardName = ''
		this.cardTitle = ''
		this.cardBuffs = new CardBuffs(this)
		this.cardTribes = []
		this.cardDescription = ''
	}

	public evaluateVariables(): RichTextVariables {
		return {}
	}
}
