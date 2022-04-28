import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import PlayTargetDefinitionBuilder from '@src/game/models/targetDefinitions/PlayTargetDefinitionBuilder'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import ServerCard from '../ServerCard'
import ServerGame from '../ServerGame'

export interface PlayTargetValidatorArguments {
	card: ServerCard
	owner: ServerPlayerInGame
	targetRow: ServerBoardRow
	targetPosition: number
}

export default class PlayTargetDefinition {
	public readonly id: string
	public readonly game: ServerGame
	public readonly conditions: ((args: PlayTargetValidatorArguments) => boolean)[] = []
	public readonly evaluator: ((args: PlayTargetValidatorArguments) => number) | null = null

	constructor(
		id: string,
		game: ServerGame,
		conditions: ((args: PlayTargetValidatorArguments) => boolean)[],
		evaluator: ((args: PlayTargetValidatorArguments) => number) | null
	) {
		this.id = id
		this.game = game
		this.conditions = conditions
		this.evaluator = evaluator
	}

	public get targetType(): TargetType {
		return TargetType.BOARD_POSITION
	}

	public require(args: PlayTargetValidatorArguments): boolean {
		return this.conditions.every((condition) => condition(args))
	}

	public evaluate(args: PlayTargetValidatorArguments): number {
		return this.evaluator ? this.evaluator(args) : 0
	}

	public static base(game: ServerGame): PlayTargetDefinition {
		return PlayTargetDefinitionBuilder.base(game).__build()
	}
}
