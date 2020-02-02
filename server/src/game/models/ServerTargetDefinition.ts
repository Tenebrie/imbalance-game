import Ruleset from '../Ruleset'
import ServerGame from './ServerGame'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import TargetTypeWithMode from '../../types/TargetTypeWithMode'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'

export default class ServerTargetDefinition {
	private game: ServerGame
	private totalTargetCount = 0
	private orderLabels: string[][]
	private readonly targetOfTypeCount: number[][]
	private readonly validators: ((args: TargetValidatorArguments) => boolean)[][][] = []
	private validSimultaneousTargets: [TargetTypeWithMode, TargetTypeWithMode][] = []

	constructor(game: ServerGame) {
		this.game = game
		this.validators = []
		this.orderLabels = []
		this.targetOfTypeCount = []
		for (const targetingReason in Object.values(TargetMode)) {
			this.orderLabels[targetingReason] = []
			this.targetOfTypeCount[targetingReason] = []
			this.validators[targetingReason] = []
			for (const targetType in Object.values(TargetType)) {
				this.orderLabels[targetingReason][targetType] = ''
				this.targetOfTypeCount[targetingReason][targetType] = 0
				this.validators[targetingReason][targetType] = []
			}
		}
	}

	public setTotalTargets(count: number): ServerTargetDefinition {
		this.totalTargetCount = count
		return this
	}

	public setOrderLabel(reason: TargetMode, type: TargetType, label: string): ServerTargetDefinition {
		this.orderLabels[reason][type] = label
		return this
	}

	public allowType(reason: TargetMode, type: TargetType, atMost: number = 1): ServerTargetDefinition {
		this.targetOfTypeCount[reason][type] = atMost
		return this
	}

	public disallowType(reason: TargetMode, type: TargetType): ServerTargetDefinition {
		this.targetOfTypeCount[reason][type] = 0
		return this
	}

	public requireValidation(reason: TargetMode, type: TargetType, validator: (args: TargetValidatorArguments) => boolean): ServerTargetDefinition {
		this.validators[reason][type].push(validator)
		return this
	}

	public clearValidation(reason: TargetMode, type: TargetType): ServerTargetDefinition {
		this.validators[reason][type] = []
		return this
	}

	public allowSimultaneously(left: [TargetMode, TargetType], right: [TargetMode, TargetType]): ServerTargetDefinition {
		this.validSimultaneousTargets.push([{ targetMode: left[0], targetType: left[1] }, { targetMode: right[0], targetType: right[1] }])
		return this
	}

	public getTotalTargetCount(): number {
		return this.totalTargetCount
	}

	public getOrderLabel(reason: TargetMode, type: TargetType): string {
		return this.orderLabels[reason][type]
	}

	public getTargetOfTypeCount(targetMode: TargetMode, targetType: TargetType): number {
		return this.targetOfTypeCount[targetMode][targetType]
	}

	public validate(reason: TargetMode, type: TargetType, args: TargetValidatorArguments): boolean {
		return this.validators[reason][type].every(validator => validator(args))
	}

	public isValidSimultaneously(left: TargetTypeWithMode, right: TargetTypeWithMode): boolean {
		return !!this.validSimultaneousTargets.find(tuple => {
			const tuplesEqual = this.targetTypesEqual(tuple[0], left) && this.targetTypesEqual(tuple[1], right)
			const tuplesEqualInReverse = this.targetTypesEqual(tuple[1], left) && this.targetTypesEqual(tuple[0], right)
			return tuplesEqual || tuplesEqualInReverse
		})
	}

	private targetTypesEqual(left: TargetTypeWithMode, right: TargetTypeWithMode): boolean {
		return left.targetType === right.targetType && left.targetMode === right.targetMode
	}

	public static none(game: ServerGame): ServerTargetDefinition {
		return new ServerTargetDefinition(game)
	}

	public static default(game: ServerGame): ServerTargetDefinition {
		return new ServerTargetDefinition(game)
			.setOrderLabel(TargetMode.ORDER_ATTACK, TargetType.UNIT, 'target.attack.unit')
			.setOrderLabel(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW, 'target.attack.row')
			.setOrderLabel(TargetMode.ORDER_DRAIN, TargetType.UNIT, 'target.drain.unit')
			.setOrderLabel(TargetMode.ORDER_DRAIN, TargetType.BOARD_ROW, 'target.drain.row')
			.setOrderLabel(TargetMode.ORDER_SUPPORT, TargetType.UNIT, 'target.support.unit')
			.setOrderLabel(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW, 'target.support.row')
			.setOrderLabel(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, 'target.move.row')
	}

	public static defaultUnitOrder(game: ServerGame): ServerTargetDefinition {
		return ServerTargetDefinition.default(game)
			.setTotalTargets(1)
			.allowType(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW)
			.requireValidation(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, (args: TargetValidatorArguments) => {
				const thisUnit = args.thisUnit
				const targetRow = args.targetRow!

				const distanceToRow = Math.abs(thisUnit.rowIndex - targetRow.index)
				const rowIsFull = targetRow.cards.length >= Ruleset.MAX_CARDS_PER_ROW

				return distanceToRow === 1 && !rowIsFull && (targetRow.owner === thisUnit.owner || targetRow.owner === null || targetRow.cards.length === 0)
			})
			.allowType(TargetMode.ORDER_ATTACK, TargetType.UNIT)
			.requireValidation(TargetMode.ORDER_ATTACK, TargetType.UNIT, (args: TargetValidatorArguments) => {
				const thisUnit = args.thisUnit
				const targetUnit = args.targetUnit!
				const distanceToTarget = Math.abs(thisUnit.rowIndex - targetUnit.rowIndex)
				return distanceToTarget <= thisUnit.card.attackRange && targetUnit.owner === game.getOpponent(thisUnit.owner)
			})
	}
}
