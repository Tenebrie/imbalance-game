import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import {BoardUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import Core from '@/Pixi/Core'
import UnitMessage from '@shared/models/network/UnitMessage'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'

const IncomingBoardUpdateMessages: {[ index in BoardUpdateMessageType ]: IncomingMessageHandlerFunction } = {
	[BoardUpdateMessageType.UNIT_CREATE]: (data: UnitMessage) => {
		if (Core.board.findUnitById(data.card.id)) { return }

		Core.input.clearCardInLimbo(data.card.id)
		Core.board.unitsOnHold.push(RenderedUnit.fromMessage(data))
	},

	[BoardUpdateMessageType.UNIT_INSERT]: (data: UnitMessage) => {
		if (Core.board.findInsertedById(data.card.id)) { return }

		Core.board.insertUnitFromHold(data.card.id, data.rowIndex, data.unitIndex)
	},

	[BoardUpdateMessageType.UNIT_MOVE]: (data: UnitMessage) => {
		const unit = Core.board.findUnitById(data.card.id)
		if (!unit) { return }

		Core.board.removeUnit(unit)
		Core.board.insertUnit(unit, data.rowIndex, data.unitIndex)
	},

	[BoardUpdateMessageType.UNIT_DESTROY]: (data: CardRefMessage) => {
		const unit = Core.board.findUnitById(data.id)
		if (!unit) { return }

		Core.board.destroyUnit(unit)
	},

	[BoardUpdateMessageType.ROW_OWNER]: (data: BoardRowMessage) => {
		Core.board.rows[data.index].owner = Core.getPlayerOrNull(data.ownerId)
	},
}

export default IncomingBoardUpdateMessages
