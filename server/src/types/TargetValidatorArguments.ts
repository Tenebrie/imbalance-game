import ServerUnit from '../game/models/ServerUnit'
import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerCardTarget from '../game/models/ServerCardTarget'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'

type TargetValidatorArguments = {
	thisCard?: ServerCard
	thisCardOwner?: ServerPlayerInGame
	thisUnit?: ServerUnit
	targetCard?: ServerCard
	targetUnit?: ServerUnit
	targetRow?: ServerBoardRow
	previousTargets?: ServerCardTarget[]
}

export default TargetValidatorArguments
