import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import TargetValidatorArguments from '@src/types/TargetValidatorArguments'
import { ValueGetter } from '@src/utils/LeaderStats'

export default class DeployTargetDefinition<EventArgs extends TargetValidatorArguments> {
	public readonly id: string
	public readonly card: ServerCard
	public readonly targetType: TargetType

	private readonly __targetCount: number | ValueGetter
	private readonly __totalTargetCount: number | ValueGetter
	private readonly __conditions: ((args: EventArgs) => boolean)[]
	private readonly __performCallbacks: ((args: EventArgs) => void)[]
	private readonly __finalizeCallbacks: ((args: EventArgs) => void)[]
	private readonly __evaluator: ((args: EventArgs) => number) | null
	private readonly __label: string
	private readonly __preventSorting: boolean

	public constructor(
		id: string,
		card: ServerCard,
		targetType: TargetType,
		targetCount: number | ValueGetter,
		totalTargetCount: number | ValueGetter,
		conditions: ((args: EventArgs) => boolean)[],
		performCallbacks: ((args: EventArgs) => void)[],
		finalizeCallbacks: ((args: EventArgs) => void)[],
		evaluator: ((args: EventArgs) => number) | null,
		label: string,
		preventSorting: boolean
	) {
		this.id = id
		this.card = card
		this.targetType = targetType

		this.__targetCount = targetCount
		this.__totalTargetCount = totalTargetCount
		this.__conditions = conditions
		this.__performCallbacks = performCallbacks
		this.__finalizeCallbacks = finalizeCallbacks
		this.__evaluator = evaluator
		this.__label = label
		this.__preventSorting = preventSorting
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

	public shouldPreventSorting(): boolean {
		return this.__preventSorting
	}

	public require(args: EventArgs): boolean {
		return this.__conditions.every((condition) => condition(args))
	}

	public perform(args: EventArgs): void {
		this.__performCallbacks.forEach((callback) => {
			callback(args)
		})
	}

	public finalize(args: EventArgs): void {
		this.__finalizeCallbacks.forEach((callback) => {
			callback(args)
		})
	}

	public evaluate(args: EventArgs): number {
		return this.__evaluator ? this.__evaluator(args) : 0
	}
}
