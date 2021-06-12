import ServerPlayer from '../../players/ServerPlayer'
import ServerUnit from '../../models/ServerUnit'
import UnitMessage from '@shared/models/network/UnitMessage'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { BoardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ServerBoardRow from '../../models/ServerBoardRow'
import OpenRowBuffMessage from '@shared/models/network/buffs/OpenRowBuffMessage'
import { ServerCardBuff, ServerRowBuff } from '@src/game/models/buffs/ServerBuff'

export default {
	notifyAboutUnitCreated(unit: ServerUnit): void {
		unit.game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_INSERT,
				data: new UnitMessage(unit),
			})
		})
	},

	notifyAboutUnitMoved(unit: ServerUnit): void {
		unit.game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_MOVE,
				data: new UnitMessage(unit),
			})
		})
	},

	notifyAboutUnitDestroyed(unit: ServerUnit): void {
		unit.game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_DESTROY,
				data: new CardRefMessage(unit.card),
			})
		})
	},

	notifyAboutRowOwnershipChanged(player: ServerPlayer, row: ServerBoardRow): void {
		row.game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_OWNER,
				data: new BoardRowMessage(row),
			})
		})
	},

	notifyAboutRowBuffAdded(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner.player
		const opponent = row.owner.opponent.player
		const message = new OpenRowBuffMessage(buff)

		owner.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_ADD,
			data: message,
		})
		opponent.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_ADD,
			data: message,
		})
	},

	notifyAboutRowBuffDurationChanged(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner.player
		const opponent = row.owner.opponent.player
		const message = new OpenRowBuffMessage(buff)

		owner.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_DURATION,
			data: message,
		})
		opponent.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_DURATION,
			data: message,
		})
	},

	notifyAboutRowBuffRemoved(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner.player
		const opponent = row.owner.opponent.player
		const message = new OpenRowBuffMessage(buff)

		owner.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_REMOVE,
			data: message,
		})
		opponent.sendMessage({
			type: BoardUpdateMessageType.ROW_BUFF_REMOVE,
			data: message,
		})
	},
}
