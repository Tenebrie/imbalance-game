import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import RichTextVariables from '../RichTextVariables'
import BuffContainerMessage from './BuffContainerMessage'
import CardColor from '../../enums/CardColor'
import CardFeature from '../../enums/CardFeature'
import CardFaction from '../../enums/CardFaction'

export default class CardMessage {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	name: string
	title: string
	buffs: BuffContainerMessage
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	description: string
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number

	power: number
	maxPower: number
	armor: number
	maxArmor: number
	attack: number
	attackRange: number

	basePower: number
	baseArmor: number
	baseAttack: number
	baseAttackRange: number

	constructor(card: Card) {
		this.id = card.id
		this.type = card.type
		this.class = card.class
		this.color = card.color
		this.faction = card.faction

		this.name = card.name
		this.title = card.title
		this.buffs = new BuffContainerMessage(card.buffs)
		this.baseTribes = card.baseTribes.slice()
		this.baseFeatures = card.baseFeatures.slice()
		this.description = card.description
		this.relatedCards = card.relatedCards.slice()
		this.variables = card.evaluateVariables()
		this.sortPriority = card.sortPriority

		this.power = card.power
		this.maxPower = card.maxPower
		this.armor = card.armor
		this.maxArmor = card.maxArmor
		this.attack = card.attack
		this.attackRange = card.attackRange

		this.basePower = card.basePower
		this.baseAttack = card.baseAttack
		this.baseAttackRange = card.baseAttackRange
		this.baseArmor = card.baseArmor
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
