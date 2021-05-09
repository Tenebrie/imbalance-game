import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerUnit from '../game/models/ServerUnit'
import { ValidServerCardTarget } from '@src/game/models/ServerCardTargeting'

export interface CardTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	previousTargets: ValidServerCardTarget[]
}

export interface UnitTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	targetUnit: ServerUnit
	previousTargets: ValidServerCardTarget[]
}

export interface RowTargetValidatorArguments {
	sourceCard: ServerCard
	targetRow: ServerBoardRow
	previousTargets: ValidServerCardTarget[]
}

export interface PositionTargetValidatorArguments {
	sourceCard: ServerCard
	targetRow: ServerBoardRow
	targetPosition: number
	previousTargets: ValidServerCardTarget[]
}

type TargetValidatorArguments =
	| CardTargetValidatorArguments
	| UnitTargetValidatorArguments
	| RowTargetValidatorArguments
	| PositionTargetValidatorArguments
export default TargetValidatorArguments
