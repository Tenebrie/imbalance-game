import ServerCardOnBoard from '../game/models/ServerCardOnBoard'
import ServerGameBoardRow from '../game/models/ServerGameBoardRow'

type TargetValidatorArguments = {
	thisUnit: ServerCardOnBoard
	targetUnit?: ServerCardOnBoard
	targetRow?: ServerGameBoardRow
}

export default TargetValidatorArguments
