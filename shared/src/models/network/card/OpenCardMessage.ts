import Card from '../../Card'
import CardType from '../../../enums/CardType'
import CardTribe from '../../../enums/CardTribe'
import RichTextVariables from '../../RichTextVariables'
import OpenBuffContainerMessage from '../buffContainer/OpenBuffContainerMessage'
import CardColor from '../../../enums/CardColor'
import CardFeature from '../../../enums/CardFeature'
import CardFaction from '../../../enums/CardFaction'
import OpenCardStatsMessage from '../cardStats/OpenCardStatsMessage'
import CardMessage from './CardMessage'

export default class OpenCardMessage implements CardMessage {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	name: string
	title: string
	flavor: string
	description: string

	stats: OpenCardStatsMessage
	buffs: OpenBuffContainerMessage
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	isCollectible: boolean
	isExperimental: boolean

	isHidden = false

	constructor(card: Card) {
		this.id = card.id
		this.type = card.type
		this.class = card.class
		this.color = card.color
		this.faction = card.faction

		this.name = card.name
		this.title = card.title
		this.flavor = card.flavor
		this.description = card.description

		this.stats = new OpenCardStatsMessage(card.stats)
		this.buffs = new OpenBuffContainerMessage(card.buffs)
		this.baseTribes = card.baseTribes.slice()
		this.baseFeatures = card.baseFeatures.slice()
		this.relatedCards = card.relatedCards.slice()
		this.variables = card.variables
		this.sortPriority = card.sortPriority
		this.isCollectible = card.isCollectible
		this.isExperimental = card.isExperimental
	}
}
