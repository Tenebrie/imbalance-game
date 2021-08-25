import BuffContainer from './BuffContainer'
import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import CardColor from '../enums/CardColor'
import RichTextVariables from './RichTextVariables'
import CardFeature from '../enums/CardFeature'
import CardFaction from '../enums/CardFaction'
import CardStats from './CardStats'
import ExpansionSet from '../enums/ExpansionSet'
import { CardLocalization } from './cardLocalization/CardLocalization'

export default interface Card {
	id: string
	type: CardType
	class: string
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
