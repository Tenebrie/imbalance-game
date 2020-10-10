import ServerGame from '../ServerGame'
import {CardTargetValidatorArguments, RowTargetValidatorArguments, UnitTargetValidatorArguments} from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'
import TargetDefinition from './TargetDefinition'
import {ServerCardTargetCard, ServerCardTargetRow} from '../ServerCardTarget'

export default class SimpleTargetDefinitionBuilder implements TargetDefinitionBuilder {
	private readonly builder: StandardTargetDefinitionBuilder
	private readonly targetMode: TargetMode

	public constructor(builder: StandardTargetDefinitionBuilder, targetMode: TargetMode) {
		this.builder = builder
		this.targetMode = targetMode
	}

	public build(): TargetDefinition {
		return this.builder.build()
	}

	public commit(): StandardTargetDefinitionBuilder {
		return this.builder
	}

	public totalTargets(count: number | (() => number)): SimpleTargetDefinitionBuilder {
		this.builder.targetsTotal(count)
		return this
	}

	public label(type: TargetType, label: string): SimpleTargetDefinitionBuilder {
		this.builder.label(this.targetMode, type, label)
		return this
	}

	public target(type: TargetType, count: number | (() => number) = 1): SimpleTargetDefinitionBuilder {
		this.builder.targetsOfType(this.targetMode, type, count)
		return this
	}

	/* Require condition
	 * -----------------
	 * The target will only be considered valid if all require conditions return true
	 */
	public require(type: TargetType.UNIT, condition: (args: UnitTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.CARD_IN_LIBRARY, condition: (args: CardTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.CARD_IN_UNIT_HAND, condition: (args: CardTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.CARD_IN_SPELL_HAND, condition: (args: CardTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.CARD_IN_UNIT_DECK, condition: (args: CardTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.CARD_IN_SPELL_DECK, condition: (args: CardTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType.BOARD_ROW, condition: (args: RowTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType, condition: (args: CardTargetValidatorArguments & UnitTargetValidatorArguments & RowTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder
	public require(type: TargetType, condition: (args: CardTargetValidatorArguments & UnitTargetValidatorArguments & RowTargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder {
		const newCondition = condition as (args: CardTargetValidatorArguments | UnitTargetValidatorArguments | RowTargetValidatorArguments) => boolean
		this.builder.require(this.targetMode, type, newCondition)
		return this
	}

	/* Evaluate target
	 * ------------------------
	 * Evaluate the expected value this target is going to provide if selected.
	 *
	 * Used for AI purposes.
	 */
	public evaluate(type: TargetType.UNIT, evaluator: (args: UnitTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.CARD_IN_LIBRARY, evaluator: (args: CardTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.CARD_IN_UNIT_HAND, evaluator: (args: CardTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.CARD_IN_SPELL_HAND, evaluator: (args: CardTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.CARD_IN_UNIT_DECK, evaluator: (args: CardTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.CARD_IN_SPELL_DECK, evaluator: (args: CardTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType.BOARD_ROW, evaluator: (args: RowTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder
	public evaluate(type: TargetType, evaluator: (args: CardTargetValidatorArguments & UnitTargetValidatorArguments & RowTargetValidatorArguments) => number): SimpleTargetDefinitionBuilder {
		const newEvaluator = evaluator as (args: CardTargetValidatorArguments | UnitTargetValidatorArguments | RowTargetValidatorArguments) => number
		this.builder.evaluate(this.targetMode, type, newEvaluator)
		return this
	}

	public requireUnique(targetType: TargetType): SimpleTargetDefinitionBuilder {
		return this.require(targetType, args => {
			const applicablePreviousTargets = args.previousTargets?.filter(target => target.targetMode === this.targetMode && target.targetType === targetType) || []
			return (!args.targetCard || !applicablePreviousTargets.find(target => target instanceof ServerCardTargetCard && target.targetCard === args.targetCard)) &&
				(!args.targetRow || !applicablePreviousTargets.find(target => target instanceof ServerCardTargetRow && target.targetRow === args.targetRow))
		})
	}

	public requireAlliedUnit(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.UNIT, args => {
			const owner = args.sourceCard.owner
			const targetUnit = args.targetCard.unit
			return (!!owner && !!targetUnit && owner === targetUnit.owner)
		})
	}

	public requireEnemyUnit(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.UNIT, args => {
			const owner = args.sourceCard.owner
			const targetUnit = args.targetCard.unit
			return (!!owner && !!targetUnit && owner !== targetUnit.owner)
		})
	}

	public requirePlayersRow(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.BOARD_ROW, args => {
			return !!args.targetRow.owner && !!args.sourceCard.owner && args.targetRow.owner === args.sourceCard.owner
		})
	}

	public requireOpponentsRow(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.BOARD_ROW, args => {
			return !!args.sourceCard.owner && args.targetRow.owner === args.sourceCard.owner.opponent
		})
	}

	public requireEmptyRow(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length === 0
		})
	}

	public requireNotEmptyRow(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length > 0
		})
	}

	public requireNotSelf(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.UNIT, args => {
			return !args.targetCard || args.sourceCard !== args.targetCard
		})
	}

	public requireCardInPlayersHand(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner === args.sourceCard.owner
		}).require(TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner === args.sourceCard.owner
		})
	}

	public requireCardInOpponentsHand(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner !== args.sourceCard.owner
		}).require(TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner !== args.sourceCard.owner
		})
	}

	public requireCardInPlayersDeck(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner === args.sourceCard.owner
		}).require(TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner === args.sourceCard.owner
		})
	}

	public requireCardInOpponentsDeck(): SimpleTargetDefinitionBuilder {
		return this.require(TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner !== args.sourceCard.owner
		}).require(TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner !== args.sourceCard.owner
		})
	}

	public merge(targetDefinition: StandardTargetDefinitionBuilder): SimpleTargetDefinitionBuilder {
		this.builder.merge(targetDefinition)
		return this
	}

	public static base(game: ServerGame, targetMode: TargetMode): SimpleTargetDefinitionBuilder {
		return new SimpleTargetDefinitionBuilder(StandardTargetDefinitionBuilder.base(game), targetMode)
	}
}
