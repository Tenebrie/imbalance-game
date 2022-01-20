import CardColor from '../../../enums/CardColor'
import CardFaction from '../../../enums/CardFaction'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import CardType from '../../../enums/CardType'
import ExpansionSet from '../../../enums/ExpansionSet'
import Card from '../../Card'
import { CardLocalization, CardLocalizationEntry } from '../../cardLocalization/CardLocalization'
import HiddenBuffContainerMessage from '../buffContainer/HiddenBuffContainerMessage'
import HiddenCardStatsMessage from '../cardStats/HiddenCardStatsMessage'
import CardMessage from './CardMessage'

const defaultLocalization: CardLocalizationEntry = {
	name: '',
	title: '',
	flavor: '',
	listName: '',
	description: '',
}

export default class HiddenCardMessage implements CardMessage {
	id: string
	type: CardType
	class: string
	color = CardColor.TOKEN
	faction = CardFaction.NEUTRAL
	artworkClass: string

	stats: HiddenCardStatsMessage
	buffs: HiddenBuffContainerMessage
	localization: CardLocalization
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables = {}
	sortPriority: number
	expansionSet = ExpansionSet.BASE

	isCollectible: boolean
	isExperimental: boolean

	isHidden = true

	constructor(card: Card) {
		this.id = card.id
		this.type = card.type
		if (card.type === CardType.UNIT) {
			this.class = 'unitHidden'
		} else {
			this.class = 'spellHidden'
		}
		this.artworkClass = this.class

		this.stats = new HiddenCardStatsMessage(card.stats)
		this.buffs = new HiddenBuffContainerMessage(card.buffs)
		this.localization = {
			en: defaultLocalization,
			ru: defaultLocalization,
		}

		this.baseTribes = []
		this.baseFeatures = []
		this.relatedCards = []
		this.sortPriority = 0

		this.isCollectible = false
		this.isExperimental = false
	}
}
