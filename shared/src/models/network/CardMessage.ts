import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import RichTextVariables from '../RichTextVariables'
import BuffContainer from '../BuffContainer'
import CardBuffsMessage from './CardBuffsMessage'
import CardColor from '../../enums/CardColor'
import CardFeature from '../../enums/CardFeature'

export default class CardMessage implements Card {
	id: string
	type: CardType
	class: string
	color: CardColor

	name: string
	title: string
	buffs: BuffContainer
	tribes: CardTribe[]
	features: CardFeature[]
	description: string
	variables: RichTextVariables

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
		this.type = card.type
		this.class = card.class
		this.color = card.color

		this.name = card.name
		this.title = card.title
		this.buffs = new CardBuffsMessage(card.buffs)
		this.tribes = card.tribes.slice()
		this.features = card.features.slice()
		this.description = card.description
		this.variables = card.evaluateVariables()

		this.power = card.power
		this.attack = card.attack
		this.attackRange = card.attackRange
		this.healthArmor = card.healthArmor

		this.basePower = card.basePower
		this.baseAttack = card.baseAttack
		this.baseAttackRange = card.baseAttackRange
		this.baseHealthArmor = card.baseHealthArmor
	}

	evaluateVariables(): RichTextVariables {
		return this.variables
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}

	static fromCardWithVariables(card: Card, cardVariables: RichTextVariables): CardMessage {
		const message = new CardMessage(card)
		message.variables = cardVariables
		return message
	}
}
