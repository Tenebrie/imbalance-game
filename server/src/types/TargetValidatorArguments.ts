import ServerCardOnBoard from '../game/models/ServerCardOnBoard'
import ServerGameBoardRow from '../game/models/ServerGameBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerCardTarget from '../game/models/ServerCardTarget'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'

type TargetValidatorArguments = {
	thisCard?: ServerCard
	thisCardOwner?: ServerPlayerInGame
	thisUnit?: ServerCardOnBoard
	targetCard?: ServerCard
	targetUnit?: ServerCardOnBoard
	targetRow?: ServerGameBoardRow
	previousTargets?: ServerCardTarget[]
}

export default TargetValidatorArguments
