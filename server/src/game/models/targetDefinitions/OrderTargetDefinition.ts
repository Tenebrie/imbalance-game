import TargetType from '@shared/enums/TargetType'
import TargetValidatorArguments from '@src/types/TargetValidatorArguments'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'
import ServerCard from '@src/game/models/ServerCard'

export default class OrderTargetDefinition<EventArgs extends TargetValidatorArguments> {
	public readonly id: string
	public readonly card: ServerCard
	public readonly targetType: TargetType

	private readonly __targetCount: number | LeaderStatValueGetter
	private readonly __totalTargetCount: number | LeaderStatValueGetter
	private readonly __conditions: ((args: EventArgs) => boolean)[]
	private readonly __performCallbacks: ((args: EventArgs) => void)[]
	private readonly __evaluator: ((args: EventArgs) => number) | null
	private readonly __label: string

	public constructor(
		id: string,
		card: ServerCard,
		targetType: TargetType,
		targetCount: number | LeaderStatValueGetter,
		totalTargetCount: number | LeaderStatValueGetter,
		conditions: ((args: EventArgs) => boolean)[],
		performCallbacks: ((args: EventArgs) => void)[],
		evaluator: ((args: EventArgs) => number) | null,
		label: string
	) {
		this.id = id
		this.card = card
		this.targetType = targetType

		this.__targetCount = targetCount
		this.__totalTargetCount = totalTargetCount
		this.__conditions = conditions
		this.__performCallbacks = performCallbacks
		this.__evaluator = evaluator
		this.__label = label
	}

	public get targetCount(): number {
		return typeof this.__targetCount === 'number' ? this.__targetCount : this.__targetCount(this.card)
	}

	public get totalTargetCount(): number {
		return typeof this.__totalTargetCount === 'number' ? this.__totalTargetCount : this.__totalTargetCount(this.card)
	}

	public get label(): string {
		return this.__label
	}

	public require(args: EventArgs): boolean {
		return this.__conditions.every((condition) => condition(args))
	}

	public perform(args: EventArgs): void {
		this.__performCallbacks.forEach((callback) => {
			callback(args)
		})
	}

	public evaluate(args: EventArgs, defaultValue: number): number {
		return this.__evaluator ? this.__evaluator(args) : defaultValue
	}
}
