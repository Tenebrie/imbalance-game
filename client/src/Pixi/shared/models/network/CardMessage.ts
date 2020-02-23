import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import UnitSubtype from '../../enums/CardColor'
import RichTextVariables from '../RichTextVariables'
import CardBuffs from '../CardBuffs'
import CardBuffsMessage from './CardBuffsMessage'

export default class CardMessage implements Card {
	id: string
	cardType: CardType
	cardClass: string
	unitSubtype: UnitSubtype | null

	cardName: string
	cardTitle: string
	cardBuffs: CardBuffs
	cardTribes: CardTribe[]
	cardDescription: string
	cardVariables: RichTextVariables

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
		this.cardBuffs = new CardBuffsMessage(card.cardBuffs)
		this.cardTribes = card.cardTribes.slice()
		this.cardDescription = card.cardDescription
		this.cardVariables = card.evaluateVariables()

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
		return this.cardVariables
	}

	static fromCard(card: Card): CardMessage {
		return new CardMessage(card)
	}

	static fromCardWithVariables(card: Card, cardVariables: RichTextVariables): CardMessage {
		const message = new CardMessage(card)
		message.cardVariables = cardVariables
		return message
	}
}
