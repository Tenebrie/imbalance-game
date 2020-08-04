import BuffContainer from './BuffContainer'
import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import CardColor from '../enums/CardColor'
import RichTextVariables from './RichTextVariables'
import CardFeature from '../enums/CardFeature'
import CardFaction from '../enums/CardFaction'
import CardKeyword from '../enums/CardKeyword'

export default class Card {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	name: string
	title: string
	buffs: BuffContainer
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	baseKeywords: CardKeyword[]
	baseRelatedCards: string[]
	description: string
	variables: RichTextVariables
	sortPriority: number

	power = 0
	maxPower = 0
	armor = 0
	maxArmor = 0
	attack = 0
	attackRange = 1

	basePower = 0
	baseArmor = 0
	baseAttack = 0
	baseAttackRange = 1

	constructor(id: string, type: CardType, cardClass: string) {
		this.id = id
		this.type = type
		this.class = cardClass
		this.color = null
		this.variables = {}

		this.name = ''
		this.title = ''
		this.buffs = new BuffContainer(this)
		this.baseTribes = []
		this.baseFeatures = []
		this.description = ''
		this.sortPriority = 0
	}

	public evaluateVariables(): RichTextVariables {
		return {}
	}
}
