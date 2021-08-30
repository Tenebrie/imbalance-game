import CardColor from '../../../enums/CardColor'
import CardFaction from '../../../enums/CardFaction'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import CardType from '../../../enums/CardType'
import ExpansionSet from '../../../enums/ExpansionSet'
import Card from '../../Card'
import { CardLocalization } from '../../cardLocalization/CardLocalization'
import RichTextVariables from '../../RichTextVariables'
import OpenBuffContainerMessage from '../buffContainer/OpenBuffContainerMessage'
import OpenCardStatsMessage from '../cardStats/OpenCardStatsMessage'
import CardMessage from './CardMessage'

export default class OpenCardMessage implements CardMessage {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	stats: OpenCardStatsMessage
	buffs: OpenBuffContainerMessage
	localization: CardLocalization
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	expansionSet: ExpansionSet

	isCollectible: boolean
	isExperimental: boolean

	isHidden = false

	constructor(card: Card) {
		this.id = card.id
		this.type = card.type
		this.class = card.class
		this.color = card.color
		this.faction = card.faction

		this.stats = new OpenCardStatsMessage(card.stats)
		this.buffs = new OpenBuffContainerMessage(card.buffs)
		this.localization = card.localization
		this.baseTribes = card.baseTribes.slice()
		this.baseFeatures = card.baseFeatures.slice()
		this.relatedCards = card.relatedCards.slice()
		this.variables = card.variables
		this.sortPriority = card.sortPriority
		this.expansionSet = card.expansionSet
		this.isCollectible = card.isCollectible
		this.isExperimental = card.isExperimental
	}
}
