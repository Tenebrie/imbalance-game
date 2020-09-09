import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'
import TargetDefinition from './TargetDefinition'

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

	/* Validate target
	 * ------------------------
	 * The target will only be considered valid if all validators return true
	 */
	public validate(type: TargetType, validator: (args: TargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder {
		this.builder.validate(this.targetMode, type, validator)
		return this
	}

	/* Evaluate target
	 * ------------------------
	 * Evaluate the expected value this target is going to provide if selected.
	 *
	 * Used for AI purposes.
	 */
	public evaluate(type: TargetType, evaluator: (args: TargetValidatorArguments) => number): SimpleTargetDefinitionBuilder {
		this.builder.evaluate(this.targetMode, type, evaluator)
		return this
	}

	public requireUnique(targetType: TargetType): SimpleTargetDefinitionBuilder {
		return this.validate(targetType, args => {
			const applicablePreviousTargets = args.previousTargets.filter(target => target.targetMode === this.targetMode && target.targetType === targetType)
			return (!args.targetCard || !applicablePreviousTargets.find(target => target.targetCard === args.targetCard)) &&
				(!args.targetRow || !applicablePreviousTargets.find(target => target.targetRow === args.targetRow))
		})
	}

	public requireInStaticRange(targetType: TargetType, range: number): SimpleTargetDefinitionBuilder {
		return this.validate(targetType, args => {
			const thisUnit = args.sourceCard.unit
			const rowIndex = targetType === TargetType.UNIT ? args.targetCard.unit.rowIndex : args.targetRow.index
			return Math.abs(thisUnit.rowIndex - rowIndex) <= range
		})
	}

	public requireAlliedUnit(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.UNIT, args => {
			const sourceUnit = args.sourceCard.unit
			const targetUnit = args.targetCard.unit
			return (args.sourceCardOwner && args.sourceCardOwner === targetUnit.owner) || (sourceUnit && sourceUnit.owner === targetUnit.owner)
		})
	}

	public requireEnemyUnit(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.UNIT, args => {
			const sourceUnit = args.sourceCard.unit
			const targetUnit = args.targetCard.unit
			return (args.sourceCardOwner && args.sourceCardOwner !== targetUnit.owner) || (sourceUnit && sourceUnit.owner !== targetUnit.owner)
		})
	}

	public requirePlayersRow(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.BOARD_ROW, args => {
			return args.targetRow.owner === args.sourceCard.owner
		})
	}

	public requireOpponentsRow(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.BOARD_ROW, args => {
			return args.targetRow.owner === args.sourceCard.owner.opponent
		})
	}

	public requireEmptyRow(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length === 0
		})
	}

	public requireNotEmptyRow(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length > 0
		})
	}

	public requireNotSelf(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.UNIT, args => {
			return !args.targetCard || args.sourceCard !== args.targetCard
		})
	}

	public requireCardInPlayersHand(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner === args.sourceCardOwner
		}).validate(TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner === args.sourceCardOwner
		})
	}

	public requireCardInOpponentsHand(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner !== args.sourceCardOwner
		}).validate(TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner !== args.sourceCardOwner
		})
	}

	public requireCardInPlayersDeck(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner === args.sourceCardOwner
		}).validate(TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner === args.sourceCardOwner
		})
	}

	public requireCardInOpponentsDeck(): SimpleTargetDefinitionBuilder {
		return this.validate(TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner !== args.sourceCardOwner
		}).validate(TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner !== args.sourceCardOwner
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
