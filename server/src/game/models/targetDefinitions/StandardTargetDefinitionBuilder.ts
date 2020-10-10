import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetDefinition from './TargetDefinition'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'

export default class StandardTargetDefinitionBuilder implements TargetDefinitionBuilder {
	private readonly game: ServerGame
	private totalTargetCountGetters: (number | (() => number))[] | undefined = undefined
	private readonly orderLabels: string[][]
	private readonly targetOfTypeCountGetters: (number | (() => number))[][][]
	private readonly conditions: ((args: TargetValidatorArguments) => boolean)[][][] = []
	private readonly evaluators: ((args: TargetValidatorArguments) => number)[][][] = []

	constructor(game: ServerGame) {
		this.game = game
		this.conditions = []
		this.evaluators = []
		this.orderLabels = []
		this.targetOfTypeCountGetters = []
		const targetModeValues = Object.values(TargetMode).filter(val => typeof(val) === 'number')
		const targetTypeValues = Object.values(TargetType).filter(val => typeof(val) === 'number')
		for (const targetingReason in targetModeValues) {
			this.orderLabels[targetingReason] = []
			this.targetOfTypeCountGetters[targetingReason] = []
			this.conditions[targetingReason] = []
			this.evaluators[targetingReason] = []
			for (const targetType in targetTypeValues) {
				this.orderLabels[targetingReason][targetType] = ''
				this.targetOfTypeCountGetters[targetingReason][targetType] = []
				this.conditions[targetingReason][targetType] = []
				this.evaluators[targetingReason][targetType] = []
			}
		}
	}

	public build(): TargetDefinition {
		const totalTargetCount = this.totalTargetCountGetters === undefined ? [1000] : this.totalTargetCountGetters
		return new TargetDefinition(this.game, totalTargetCount, this.orderLabels, this.targetOfTypeCountGetters, this.conditions, this.evaluators)
	}

	public targetsTotal(count: number | (() => number)): StandardTargetDefinitionBuilder {
		if (this.totalTargetCountGetters === undefined) {
			this.totalTargetCountGetters = []
		}
		this.totalTargetCountGetters.push(count)
		return this
	}

	public label(reason: TargetMode, type: TargetType, label: string): StandardTargetDefinitionBuilder {
		this.orderLabels[reason][type] = label
		return this
	}

	public targetsOfType(reason: TargetMode, type: TargetType, targetCount: number | (() => number) = 1): StandardTargetDefinitionBuilder {
		this.targetOfTypeCountGetters[reason][type].push(targetCount)
		return this
	}

	public require(reason: TargetMode, type: TargetType, condition: (args: TargetValidatorArguments) => boolean): StandardTargetDefinitionBuilder {
		this.conditions[reason][type].push(condition)
		return this
	}

	public evaluate(reason: TargetMode, type: TargetType, evaluator: (args: TargetValidatorArguments) => number): StandardTargetDefinitionBuilder {
		this.evaluators[reason][type].push(evaluator)
		return this
	}

	public merge(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder {
		if (this.totalTargetCountGetters && this.totalTargetCountGetters.length > 0 || targetDefinition.totalTargetCountGetters && targetDefinition.totalTargetCountGetters.length > 0) {
			this.totalTargetCountGetters = (this.totalTargetCountGetters || []).concat(targetDefinition.totalTargetCountGetters || [])
		}
		const targetModeValues = Object.values(TargetMode).filter(val => typeof(val) === 'number')
		const targetTypeValues = Object.values(TargetType).filter(val => typeof(val) === 'number')
		for (const targetingReason in targetModeValues) {
			for (const targetType in targetTypeValues) {
				this.targetOfTypeCountGetters[targetingReason][targetType] = this.targetOfTypeCountGetters[targetingReason][targetType].concat(
					targetDefinition.targetOfTypeCountGetters[targetingReason][targetType]
				)
				this.orderLabels[targetingReason][targetType] = this.orderLabels[targetingReason][targetType] || targetDefinition.orderLabels[targetingReason][targetType]
				this.conditions[targetingReason][targetType] = this.conditions[targetingReason][targetType].concat(targetDefinition.conditions[targetingReason][targetType])
				this.evaluators[targetingReason][targetType] = this.evaluators[targetingReason][targetType].concat(targetDefinition.evaluators[targetingReason][targetType])
			}
		}
		return this
	}

	public clone(): StandardTargetDefinitionBuilder {
		const clone = new StandardTargetDefinitionBuilder(this.game)
		clone.totalTargetCountGetters = this.totalTargetCountGetters
		const targetModeValues = Object.values(TargetMode).filter(val => typeof(val) === 'number')
		const targetTypeValues = Object.values(TargetType).filter(val => typeof(val) === 'number')
		for (const targetingReason in targetModeValues) {
			for (const targetType in targetTypeValues) {
				clone.targetOfTypeCountGetters[targetingReason][targetType] = this.targetOfTypeCountGetters[targetingReason][targetType]
				clone.orderLabels[targetingReason][targetType] = this.orderLabels[targetingReason][targetType]
				clone.conditions[targetingReason][targetType] = this.conditions[targetingReason][targetType]
				clone.evaluators[targetingReason][targetType] = this.evaluators[targetingReason][targetType]
			}
		}
		return clone
	}

	public static base(game: ServerGame): StandardTargetDefinitionBuilder {
		return new StandardTargetDefinitionBuilder(game)
			.label(TargetMode.DEPLOY_EFFECT, TargetType.UNIT, 'target.generic.unit')
			.label(TargetMode.DEPLOY_EFFECT, TargetType.BOARD_ROW, 'target.generic.row')
			.label(TargetMode.UNIT_ORDER, TargetType.UNIT, 'target.order.unit')
			.label(TargetMode.UNIT_ORDER, TargetType.BOARD_ROW, 'target.order.row')
			.label(TargetMode.UNIT_ORDER, TargetType.CARD_IN_UNIT_HAND, 'target.order.card.unit')
			.label(TargetMode.UNIT_ORDER, TargetType.CARD_IN_SPELL_HAND, 'target.order.card.spell')
	}
}
