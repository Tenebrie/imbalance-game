import ServerUnit from '../game/models/ServerUnit'
import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerCardTarget from '../game/models/ServerCardTarget'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'

export default interface TargetValidatorArguments {
	sourceCard: ServerCard
	sourceCardOwner?: ServerPlayerInGame
	targetCard?: ServerCard
	targetRow?: ServerBoardRow
	previousTargets?: ServerCardTarget[]
}
