import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import CardType from '@shared/enums/CardType'

export default class TargetDefinition {
	private readonly game: ServerGame
	private readonly totalTargetCountGetters: (number | (() => number))[]
	private readonly orderLabels: string[][]
	private readonly targetOfTypeCountGetters: (number | (() => number))[][][]
	private readonly conditions: ((args: TargetValidatorArguments) => boolean)[][][] = []
	private readonly evaluators: ((args: TargetValidatorArguments) => number)[][][] = []

	constructor(game: ServerGame,
		totalTargetCountGetters: (number | (() => number))[],
		orderLabels: string[][],
		targetOfTypeCountGetters: (number | (() => number))[][][],
		conditions: ((args: TargetValidatorArguments) => boolean)[][][],
		evaluators: ((args: TargetValidatorArguments) => number)[][][]) {
		this.game = game
		this.totalTargetCountGetters = totalTargetCountGetters
		this.orderLabels = orderLabels
		this.targetOfTypeCountGetters = targetOfTypeCountGetters
		this.conditions = conditions
		this.evaluators = evaluators
	}

	public getTargetCount(): number {
		return this.totalTargetCountGetters.map(value => {
			if (typeof(value) === 'function') {
				return value()
			}
			return value
		}).reduce((acc, val) => acc + val, 0)
	}

	public getOrderLabel(reason: TargetMode, type: TargetType): string {
		return this.orderLabels[reason][type]
	}

	public getTargetOfTypeCount(targetMode: TargetMode, targetType: TargetType): number {
		return this.targetOfTypeCountGetters[targetMode][targetType].map(value => {
			if (typeof(value) === 'function') {
				return value()
			}
			return value
		}).reduce((acc, val) => acc + val, 0)
	}

	public require(reason: TargetMode, type: TargetType, args: TargetValidatorArguments): boolean {
		return this.conditions[reason][type].every(condition => condition(args))
	}

	public evaluate(reason: TargetMode, type: TargetType, args: TargetValidatorArguments): number {
		return this.evaluators[reason][type].reduce((acc, evaluator) => acc + evaluator(args), 0)
	}

	public static none(game: ServerGame): StandardTargetDefinitionBuilder {
		return new StandardTargetDefinitionBuilder(game)
	}

	public static defaultCardPlayTarget(game: ServerGame): StandardTargetDefinitionBuilder {
		return StandardTargetDefinitionBuilder.base(game)
			.targetsOfType(TargetMode.CARD_PLAY, TargetType.BOARD_ROW)
			.require(TargetMode.CARD_PLAY, TargetType.BOARD_ROW, ({ targetRow }) => !targetRow.isFull())
			.require(TargetMode.CARD_PLAY, TargetType.BOARD_ROW, (args: TargetValidatorArguments) => {
				return args.sourceCard.type === CardType.SPELL || args.targetRow.owner === args.sourceCardOwner
			})
	}
}
