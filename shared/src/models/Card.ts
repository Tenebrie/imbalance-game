import CardColor from '../enums/CardColor'
import CardFaction from '../enums/CardFaction'
import CardFeature from '../enums/CardFeature'
import CardTribe from '../enums/CardTribe'
import CardType from '../enums/CardType'
import ExpansionSet from '../enums/ExpansionSet'
import BuffContainer from './BuffContainer'
import { CardLocalization } from './cardLocalization/CardLocalization'
import CardStats from './CardStats'
import RichTextVariables from './RichTextVariables'

export default interface Card {
	id: string
	type: CardType
	class: string
	artworkClass: string
	color: CardColor
	faction: CardFaction

	stats: CardStats
	buffs: BuffContainer
	localization: CardLocalization
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	expansionSet: ExpansionSet
	isCollectible: boolean
	isExperimental: boolean

	tribes: CardTribe[]
	features: CardFeature[]
}
