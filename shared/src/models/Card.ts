import BuffContainer from './BuffContainer'
import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import CardColor from '../enums/CardColor'
import RichTextVariables from './RichTextVariables'

export default class Card {
	id: string
	type: CardType
	class: string
	color: CardColor

	name: string
	title: string
	buffs: BuffContainer
	tribes: CardTribe[]
	description: string
	variables: RichTextVariables

	power = 0
	attack = 0
	attackRange = 1
	healthArmor = 0

	basePower = 0
	baseAttack = 0
	baseAttackRange = 1
	baseHealthArmor = 0

	constructor(id: string, type: CardType, cardClass: string) {
		this.id = id
		this.type = type
		this.class = cardClass
		this.color = null
		this.variables = {}

		this.name = ''
		this.title = ''
		this.buffs = new BuffContainer(this)
		this.tribes = []
		this.description = ''
	}

	public evaluateVariables(): RichTextVariables {
		return {}
	}
}
