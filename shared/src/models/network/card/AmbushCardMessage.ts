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
	name: 'Ambush',
	title: '',
	flavor: 'Traps are fun, right? Right? Right...',
	listName: '',
	description: "*Ambush:* Played face down, then flips over when the ability's condition is met.",
}

export default class AmbushCardMessage implements CardMessage {
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

	isCommunity: boolean
	isCollectible: boolean
	isExperimental: boolean

	isAmbush = true
	isHidden = false

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

		this.isCommunity = false
		this.isCollectible = false
		this.isExperimental = false
	}
}
