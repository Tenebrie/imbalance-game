import Card from './Card'
import BoardRow from './BoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'
import OpenCardMessage from './network/card/OpenCardMessage'

export type CardTargetCardAllowedTypes =
	| TargetType.UNIT
	| TargetType.CARD_IN_LIBRARY
	| TargetType.CARD_IN_UNIT_HAND
	| TargetType.CARD_IN_SPELL_HAND
	| TargetType.CARD_IN_UNIT_DECK
	| TargetType.CARD_IN_SPELL_DECK

export interface CardTargetCard {
	targetMode: TargetMode
	targetType: CardTargetCardAllowedTypes | TargetType.UNIT
	sourceCard: Card
	targetCard: Card
	targetLabel: string
	targetCardData: OpenCardMessage
}

export interface CardTargetUnit {
	targetMode: TargetMode
	targetType: TargetType.UNIT
	sourceCard: Card
	targetCard: Card
	targetLabel: string
}

export interface CardTargetRow {
	targetMode: TargetMode
	targetType: TargetType.BOARD_ROW
	sourceCard: Card
	targetRow: BoardRow
	targetLabel: string
}

type CardTarget = CardTargetCard | CardTargetUnit | CardTargetRow
export default CardTarget
