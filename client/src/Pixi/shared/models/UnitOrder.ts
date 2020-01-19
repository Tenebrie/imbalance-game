import UnitOrderType from '../enums/UnitOrderType'
import CardOnBoard from './CardOnBoard'
import GameBoardRow from './GameBoardRow'

export default interface UnitOrder {
	type: UnitOrderType
	orderedUnit: CardOnBoard
	targetUnit?: CardOnBoard
	targetRow?: GameBoardRow
}
