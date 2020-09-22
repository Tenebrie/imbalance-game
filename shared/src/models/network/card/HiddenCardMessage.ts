import Card from '../../Card'
import CardType from '../../../enums/CardType'
import HiddenBuffContainerMessage from '../buffContainer/HiddenBuffContainerMessage'
import CardFaction from '../../../enums/CardFaction'
import HiddenCardStatsMessage from '../cardStats/HiddenCardStatsMessage'
import CardMessage from './CardMessage'
import CardColor from '../../../enums/CardColor'
import CardTribe from '../../../enums/CardTribe'
import CardFeature from '../../../enums/CardFeature'
import ExpansionSet from '../../../enums/ExpansionSet'

export default class HiddenCardMessage implements CardMessage {
	id: string
	type: CardType
	class: string
	color = CardColor.TOKEN
	faction = CardFaction.NEUTRAL

	stats: HiddenCardStatsMessage
	buffs: HiddenBuffContainerMessage
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables = {}
	sortPriority: number
	expansionSet = ExpansionSet.BASE

	isCollectible: boolean
	isExperimental: boolean

	name = 'card.hidden.name'
	title = ''
	flavor = ''
	description = ''

	isHidden = true

	constructor(card: Card) {
		this.id = card.id
		this.type = card.type
		this.stats = new HiddenCardStatsMessage(card.stats)
		this.buffs = new HiddenBuffContainerMessage(card.buffs)
		if (card.type === CardType.UNIT) {
			this.class = 'unitHidden'
		} else {
			this.class = 'spellHidden'
		}

		this.baseTribes = []
		this.baseFeatures = []
		this.relatedCards = []
		this.sortPriority = 0

		this.isCollectible = false
		this.isExperimental = false
	}
}
