import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import Core from '@/Pixi/Core'
import TargetMode from '@/Pixi/shared/enums/TargetMode'
import TargetType from '@/Pixi/shared/enums/TargetType'

export default class ClientUnitOrder implements UnitOrder {
	targetMode: TargetMode
	targetType: TargetType
	orderedUnit: RenderedCardOnBoard
	targetUnit?: RenderedCardOnBoard
	targetRow?: RenderedGameBoardRow
	targetLabel: string

	constructor(targetMode: TargetMode, targetType: TargetType, orderedUnit: RenderedCardOnBoard) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.orderedUnit = orderedUnit
	}

	public static fromMessage(message: UnitOrderMessage): ClientUnitOrder {
		const orderedUnit = Core.board.findUnitById(message.orderedUnitId)
		const order = new ClientUnitOrder(message.targetMode, message.targetType, orderedUnit)
		if (message.targetType === TargetType.UNIT) {
			order.targetUnit = Core.board.findUnitById(message.targetUnitId)
		} else if (message.targetType === TargetType.BOARD_ROW) {
			order.targetRow = Core.board.rows[message.targetRowIndex]
		}
		order.targetLabel = message.targetLabel
		return order
	}
}
