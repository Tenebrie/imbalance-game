import Card from './Card'
import CardOnBoard from './CardOnBoard'
import GameBoardRow from './GameBoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'
import PlayerInGame from './PlayerInGame'

export default interface CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard?: Card
	sourceCardOwner?: PlayerInGame
	sourceUnit?: CardOnBoard
	targetCard?: Card
	targetUnit?: CardOnBoard
	targetRow?: GameBoardRow
	targetLabel: string
}
