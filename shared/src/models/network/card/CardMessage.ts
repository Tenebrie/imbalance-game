import CardType from '../../../enums/CardType'
import CardTribe from '../../../enums/CardTribe'
import RichTextVariables from '../../RichTextVariables'
import CardColor from '../../../enums/CardColor'
import CardFeature from '../../../enums/CardFeature'
import CardFaction from '../../../enums/CardFaction'
import BuffContainerMessage from '../buffContainer/BuffContainerMessage'
import CardStatsMessage from '../cardStats/CardStatsMessage'
import ExpansionSet from '../../../enums/ExpansionSet'
import { CardLocalization } from '../../cardLocalization/CardLocalization'

export default interface CardMessage {
	id: string
	type: CardType
	class: string
	color: CardColor
	faction: CardFaction

	stats: CardStatsMessage
	buffs: BuffContainerMessage
	localization: CardLocalization
	baseTribes: CardTribe[]
	baseFeatures: CardFeature[]
	relatedCards: string[]
	variables: RichTextVariables
	sortPriority: number
	expansionSet: ExpansionSet

	isCollectible: boolean
	isExperimental: boolean

	isHidden: boolean
}
