import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerCardTarget, {ServerCardTargetCard, ServerCardTargetRow} from '../game/models/ServerCardTarget'
import ServerUnit from '../game/models/ServerUnit'

export interface CardTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	previousTargets?: (ServerCardTargetCard | ServerCardTargetRow)[]
}

export interface UnitTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	targetUnit: ServerUnit
	previousTargets?: (ServerCardTargetCard | ServerCardTargetRow)[]
}

export interface RowTargetValidatorArguments {
	sourceCard: ServerCard
	targetRow: ServerBoardRow
	previousTargets?: (ServerCardTargetCard | ServerCardTargetRow)[]
}

type TargetValidatorArguments = CardTargetValidatorArguments | RowTargetValidatorArguments
export default TargetValidatorArguments
