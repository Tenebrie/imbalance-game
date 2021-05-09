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
	id: string
	targetMode: TargetMode
	targetType: CardTargetCardAllowedTypes | TargetType.UNIT
	sourceCard: Card
	targetCard: Card
	targetLabel: string
	targetCardData: OpenCardMessage
}

export interface CardTargetUnit {
	id: string
	targetMode: TargetMode
	targetType: TargetType.UNIT
	sourceCard: Card
	targetCard: Card
	targetLabel: string
}

export interface CardTargetRow {
	id: string
	targetMode: TargetMode
	targetType: TargetType.BOARD_ROW
	sourceCard: Card
	targetRow: BoardRow
	targetLabel: string
}

export interface CardTargetPosition {
	id: string
	targetMode: TargetMode
	targetType: TargetType.BOARD_POSITION
	sourceCard: Card
	targetRow: BoardRow
	targetPosition: number
	targetLabel: string
}

type CardTarget = CardTargetCard | CardTargetUnit | CardTargetRow | CardTargetPosition
export default CardTarget
