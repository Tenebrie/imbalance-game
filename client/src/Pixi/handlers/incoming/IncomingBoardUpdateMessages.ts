import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import OpenRowBuffMessage from '@shared/models/network/buffs/OpenRowBuffMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { BoardUpdateMessageHandlers, BoardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import UnitMessage from '@shared/models/network/UnitMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import Core from '@/Pixi/Core'
import RenderedBuff from '@/Pixi/models/buffs/RenderedBuff'

const IncomingBoardUpdateMessages: BoardUpdateMessageHandlers = {
	[BoardUpdateMessageType.UNIT_INSERT]: (data: UnitMessage) => {
		if (Core.board.findInsertedById(data.card.id)) {
			return
		}

		const ownerGroup = Core.getPlayerGroupOrNull(data.ownerId)
		if (!ownerGroup) {
			throw new Error(`No player group with id ${data.ownerId}`)
		}

		const card = new RenderedUnit(RenderedCard.fromMessage(data.card), ownerGroup)
		Core.input.destroyLimboCard(data.card)
		Core.board.insertUnit(card, data.rowIndex, data.unitIndex)
	},

	[BoardUpdateMessageType.UNIT_MOVE]: (data: UnitMessage) => {
		const unit = Core.board.findUnitById(data.card.id)
		if (!unit) {
			return
		}

		Core.board.removeUnit(unit)
		Core.board.insertUnit(unit, data.rowIndex, data.unitIndex)
	},

	[BoardUpdateMessageType.UNIT_DESTROY]: (data: CardRefMessage) => {
		const unit = Core.board.findUnitById(data.id)
		if (!unit) {
			return
		}

		Core.board.destroyUnit(unit)
	},

	[BoardUpdateMessageType.ROW_OWNER]: (data: BoardRowMessage) => {
		Core.board.rows[data.index].owner = Core.getPlayerGroupOrNull(data.ownerId)
	},

	[BoardUpdateMessageType.ROW_BUFF_ADD]: (data: OpenRowBuffMessage) => {
		const row = Core.board.getRow(data.parentIndex)
		if (!row) {
			return
		}

		row.buffs.add(new RenderedBuff(row.buffs, data))
	},

	[BoardUpdateMessageType.ROW_BUFF_DURATION]: (data: OpenRowBuffMessage) => {
		const row = Core.board.getRow(data.parentIndex)
		if (!row) {
			return
		}

		const buff = row.buffs.findBuffById(data.id)
		if (!buff) {
			return
		}

		buff.duration = Number(data.duration)
	},

	[BoardUpdateMessageType.ROW_BUFF_REMOVE]: (data: OpenRowBuffMessage) => {
		const row = Core.board.getRow(data.parentIndex)
		if (!row) {
			return
		}

		row.buffs.removeById(data.id)
	},
}

export default IncomingBoardUpdateMessages
