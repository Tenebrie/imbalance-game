import { v4 as getRandomId } from 'uuid'
import TargetType from '@shared/enums/TargetType'
import TargetValidatorArguments from '@src/types/TargetValidatorArguments'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'
import ServerCard from '@src/game/models/ServerCard'
import { ServerCardTargetCard, ServerCardTargetRow } from '@src/game/models/ServerCardTarget'
import OrderTargetDefinition from '@src/game/models/targetDefinitions/OrderTargetDefinition'

export default class OrderTargetDefinitionBuilder<EventArgs extends TargetValidatorArguments> {
	private readonly id: string
	private readonly card: ServerCard
	private readonly targetType: TargetType

	private __targetCount: number | LeaderStatValueGetter = 1
	private __totalTargetCount: number | LeaderStatValueGetter = Infinity
	private __conditions: ((args: EventArgs) => boolean)[] = []
	private __performCallbacks: ((args: EventArgs) => void)[] = []
	private __evaluator: ((args: EventArgs) => number) | null = null
	private __label = 'target.generic.unit'

	private constructor(card: ServerCard, targetType: TargetType) {
		this.id = `tdef:${getRandomId()}`
		this.card = card
		this.targetType = targetType
	}

	public __build(): OrderTargetDefinition<EventArgs> {
		return new OrderTargetDefinition(
			this.id,
			this.card,
			this.targetType,
			this.__targetCount,
			this.__totalTargetCount,
			this.__conditions,
			this.__performCallbacks,
			this.__evaluator,
			this.__label
		)
	}

	/* Set desired target count
	 * ------------------------
	 * Player will be requested to choose targets until that many targets are found.
	 * If no valid targets are present, the targeting will stop.
	 *
	 * Only applicable to this target definition
	 */
	public targetCount(count: number | LeaderStatValueGetter): OrderTargetDefinitionBuilder<EventArgs> {
		this.__targetCount = count
		return this
	}

	/* Set desired total target count
	 * ------------------------------
	 * Player will be requested to choose targets until that many targets are found.
	 * If no valid targets are present, the targeting will stop.
	 *
	 * Applicable to all target definitions on this card
	 */
	public totalTargetCount(count: number | LeaderStatValueGetter): OrderTargetDefinitionBuilder<EventArgs> {
		this.__totalTargetCount = count
		return this
	}

	/* Add target filtering condition
	 * ------------------------------
	 * Require a condition to be true for the row to be a valid play target
	 *
	 * The card can be played to the row if all conditions return `true` or other truthy value.
	 */
	public require(condition: (args: EventArgs) => boolean): OrderTargetDefinitionBuilder<EventArgs> {
		this.__conditions.push(condition)
		return this
	}

	/* Add selection callback function
	 * -------------------------------
	 * Perform a callback when a target is selected
	 *
	 * If any of the `perform` expressions throws an error, the execution of the chain is stopped.
	 */
	public perform(callback: (args: EventArgs) => void): OrderTargetDefinitionBuilder<EventArgs> {
		this.__performCallbacks.push(callback)
		return this
	}

	/* Add AI evaluator function
	 * -------------------------
	 * Evaluate the value an AI will get if it plays the card on a row.
	 */
	public evaluate(evaluator: (args: EventArgs) => number): OrderTargetDefinitionBuilder<EventArgs> {
		this.__evaluator = evaluator
		return this
	}

	/* Set targeting label
	 * -------------------
	 * Set targeting label displayed on player's cursor when hovering a valid target
	 */
	public label(label: string): OrderTargetDefinitionBuilder<EventArgs> {
		this.__label = label
		return this
	}

	public requireUnique(): OrderTargetDefinitionBuilder<EventArgs> {
		return this.require((args: TargetValidatorArguments) => {
			if ('targetCard' in args) {
				return !args.previousTargets.some((target) => target instanceof ServerCardTargetCard && target.targetCard === args.targetCard)
			} else {
				return !args.previousTargets.some((target) => target instanceof ServerCardTargetRow && target.targetRow === args.targetRow)
			}
		})
	}

	public requireAllied(): OrderTargetDefinitionBuilder<EventArgs> {
		return this.require((args: TargetValidatorArguments) => {
			const targetOwner = 'targetRow' in args ? args.targetRow.owner : args.targetCard.ownerNullable
			return targetOwner === args.sourceCard.ownerNullable
		})
	}

	public requireEnemy(): OrderTargetDefinitionBuilder<EventArgs> {
		return this.require((args: TargetValidatorArguments) => {
			const targetOwner = 'targetRow' in args ? args.targetRow.owner : args.targetCard.ownerNullable
			return targetOwner !== args.sourceCard.ownerNullable
		})
	}

	public requireNotSelf(): OrderTargetDefinitionBuilder<EventArgs> {
		return this.require((args: TargetValidatorArguments) => {
			return !('targetCard' in args) || args.sourceCard !== args.targetCard
		})
	}

	public requireNotEmptyRow(): OrderTargetDefinitionBuilder<EventArgs> {
		return this.require((args: TargetValidatorArguments) => {
			return 'targetRow' in args && args.targetRow.cards.length > 0
		})
	}

	public static base(card: ServerCard, targetType: TargetType): OrderTargetDefinitionBuilder<TargetValidatorArguments> {
		return new OrderTargetDefinitionBuilder(card, targetType)
	}
}
