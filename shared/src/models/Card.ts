import BuffContainer from './BuffContainer'
import CardType from '../enums/CardType'
import CardTribe from '../enums/CardTribe'
import CardColor from '../enums/CardColor'
import RichTextVariables from './RichTextVariables'
import CardFeature from '../enums/CardFeature'
import CardFaction from '../enums/CardFaction'
import CardStats from './CardStats'
import ExpansionSet from '../enums/ExpansionSet'

export default interface Card {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	name: string
	title: string
	flavor: string
	description: string

	stats: CardStats
	buffs: BuffContainer
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	expansionSet: ExpansionSet
	isCollectible: boolean
	isExperimental: boolean
}
