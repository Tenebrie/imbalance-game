import CardType from '../../../enums/CardType'
import CardTribe from '../../../enums/CardTribe'
import RichTextVariables from '../../RichTextVariables'
import CardColor from '../../../enums/CardColor'
import CardFeature from '../../../enums/CardFeature'
import CardFaction from '../../../enums/CardFaction'
import BuffContainerMessage from '../buffContainer/BuffContainerMessage'
import CardStatsMessage from '../cardStats/CardStatsMessage'

export default interface CardMessage {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	name: string
	title: string
	flavor: string
	description: string

	stats: CardStatsMessage
	buffs: BuffContainerMessage
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	isCollectible: boolean
	isExperimental: boolean

	isHidden: boolean
}
