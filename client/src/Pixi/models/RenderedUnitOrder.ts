import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import TargetingLine from '@/Pixi/models/TargetingLine'
import Core from '@/Pixi/Core'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import UnitOrderType from '@/Pixi/shared/enums/UnitOrderType'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import TargetingArrow from '@/Pixi/models/TargetingArrow'

export default class RenderedUnitOrder implements UnitOrder {
	type: UnitOrderType
	orderedUnit: RenderedCardOnBoard
	targetUnit?: RenderedCardOnBoard
	targetRow?: RenderedGameBoardRow
	targetingLine: TargetingLine
	targetingArrow: TargetingArrow

	private constructor(type: UnitOrderType, orderedUnit: RenderedCardOnBoard) {
		this.type = type
		this.orderedUnit = orderedUnit
		this.targetingLine = new TargetingLine()
		this.targetingArrow = new TargetingArrow()
	}

	public isEqual(other: RenderedUnitOrder): boolean {
		return this.type === other.type && this.orderedUnit === other.orderedUnit && this.targetUnit === other.targetUnit && this.targetRow === other.targetRow
	}

	public isEqualToMessage(other: UnitOrderMessage): boolean {
		return this.type === other.type &&
			this.orderedUnit.card.id === other.orderedUnitId &&
			((this.type === UnitOrderType.ATTACK && this.targetUnit!.card.id === other.targetUnitId) || (this.type === UnitOrderType.MOVE && this.targetRow!.index === other.targetRowIndex))
	}

	public destroy() {
		this.targetingLine.destroy()
		this.targetingArrow.destroy()
	}

	public static fromMessage(message: UnitOrderMessage): RenderedUnitOrder {
		const orderedUnit = Core.board.findUnitById(message.orderedUnitId)!

		const order = new RenderedUnitOrder(message.type, orderedUnit)
		order.targetUnit = Core.board.findUnitById(message.targetUnitId) || undefined
		order.targetRow = Core.board.rows[message.targetRowIndex]
		if (order.type === UnitOrderType.ATTACK) {
			order.targetingLine.create()
		} else if (order.type === UnitOrderType.MOVE) {
			order.targetingArrow.create()
		}
		return order
	}
}
