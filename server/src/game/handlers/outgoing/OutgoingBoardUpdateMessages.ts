import ServerUnit from '../../models/ServerUnit'
import UnitMessage from '@shared/models/network/UnitMessage'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { BoardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ServerBoardRow from '../../models/ServerBoardRow'
import OpenRowBuffMessage from '@shared/models/network/buffs/OpenRowBuffMessage'
import { ServerRowBuff } from '@src/game/models/buffs/ServerBuff'

export default {
	notifyAboutUnitCreated(unit: ServerUnit): void {
		unit.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendMessage({
					type: BoardUpdateMessageType.UNIT_INSERT,
					data: new UnitMessage(unit),
				})
			})
	},

	notifyAboutUnitMoved(unit: ServerUnit): void {
		unit.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendMessage({
					type: BoardUpdateMessageType.UNIT_MOVE,
					data: new UnitMessage(unit),
				})
			})
	},

	notifyAboutUnitDestroyed(unit: ServerUnit): void {
		unit.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendMessage({
					type: BoardUpdateMessageType.UNIT_DESTROY,
					data: new CardRefMessage(unit.card),
				})
			})
	},

	notifyAboutRowOwnershipChanged(row: ServerBoardRow): void {
		row.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) =>
				playerInGame.player.sendMessage({
					type: BoardUpdateMessageType.ROW_OWNER,
					data: new BoardRowMessage(row),
				})
			)
	},

	notifyAboutRowBuffAdded(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner
		const opponent = row.owner.opponent
		const message = new OpenRowBuffMessage(buff)

		owner.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_ADD,
				data: message,
			})
		)
		opponent.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_ADD,
				data: message,
			})
		)
	},

	notifyAboutRowBuffDurationChanged(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner
		const opponent = row.owner.opponent
		const message = new OpenRowBuffMessage(buff)

		owner.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_DURATION,
				data: message,
			})
		)
		opponent.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_DURATION,
				data: message,
			})
		)
	},

	notifyAboutRowBuffRemoved(buff: ServerRowBuff): void {
		const row = buff.parent
		if (!row.owner || !row.owner.opponent) {
			return
		}

		const owner = row.owner
		const opponent = row.owner.opponent
		const message = new OpenRowBuffMessage(buff)

		owner.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_REMOVE,
				data: message,
			})
		)
		opponent.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_BUFF_REMOVE,
				data: message,
			})
		)
	},
}
