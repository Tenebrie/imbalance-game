import CardOnBoard from './CardOnBoard'
import GameBoardRow from './GameBoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'

export default interface UnitOrder {
	targetMode: TargetMode
	targetType: TargetType
	orderedUnit: CardOnBoard
	targetUnit?: CardOnBoard
	targetRow?: GameBoardRow
	targetLabel: string
}
