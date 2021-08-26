import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import ServerUnit from '../game/models/ServerUnit'
import { ValidServerCardTarget } from '@src/game/models/ServerCardTargeting'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

// TODO: Figure out what the `player` is here
export interface CardTargetValidatorArguments {
	player: ServerPlayerInGame
	sourceCard: ServerCard
	targetCard: ServerCard
	previousTargets: ValidServerCardTarget[]
}

export interface UnitTargetValidatorArguments {
	player: ServerPlayerInGame
	sourceCard: ServerCard
	targetCard: ServerCard
	targetUnit: ServerUnit
	previousTargets: ValidServerCardTarget[]
}

export interface RowTargetValidatorArguments {
	player: ServerPlayerInGame
	sourceCard: ServerCard
	targetRow: ServerBoardRow
	previousTargets: ValidServerCardTarget[]
}

export interface PositionTargetValidatorArguments {
	player: ServerPlayerInGame
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
