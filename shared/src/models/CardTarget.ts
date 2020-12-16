import Card from './Card'
import Unit from './Unit'
import BoardRow from './BoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'
import PlayerInGame from './PlayerInGame'
import OpenCardMessage from './network/card/OpenCardMessage'

export interface CardTargetUnit {
	targetMode: TargetMode
	targetType: TargetType.UNIT
	sourceCardId: string
	targetCardId: string
	targetLabel: string
}

export type CardTargetCardAllowedTypes = TargetType.CARD_IN_LIBRARY | TargetType.CARD_IN_UNIT_HAND | TargetType.CARD_IN_SPELL_HAND | TargetType.CARD_IN_UNIT_DECK | TargetType.CARD_IN_SPELL_DECK
export interface CardTargetCard {
	targetMode: TargetMode
	targetType: CardTargetCardAllowedTypes
	sourceCardId: string
	targetCardId: string
	targetLabel: string
	targetCardData: OpenCardMessage
}

export interface CardTargetRow {
	targetMode: TargetMode
	targetType: TargetType.BOARD_ROW
	sourceCardId: string
	targetRow: BoardRow
	targetLabel: string
}

type CardTarget = CardTargetUnit | CardTargetCard | CardTargetRow
export default CardTarget
