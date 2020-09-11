import ServerPlayer from '../../players/ServerPlayer'
import ServerUnit from '../../models/ServerUnit'
import UnitMessage from '@shared/models/network/UnitMessage'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import {BoardUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ServerBoardRow from '../../models/ServerBoardRow'

export default {
	notifyAboutUnitCreated(unit: ServerUnit): void {
		unit.game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_CREATE,
				data: new UnitMessage(unit),
				highPriority: true
			})
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_INSERT,
				data: new UnitMessage(unit)
			})
		})
	},

	notifyAboutUnitMoved(unit: ServerUnit): void {
		unit.game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_MOVE,
				data: new UnitMessage(unit)
			})
		})
	},

	notifyAboutUnitDestroyed(unit: ServerUnit): void {
		unit.game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.UNIT_DESTROY,
				data: new CardRefMessage(unit.card)
			})
		})
	},

	notifyAboutRowOwnershipChanged(player: ServerPlayer, row: ServerBoardRow): void {
		row.game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: BoardUpdateMessageType.ROW_OWNER,
				data: new BoardRowMessage(row)
			})
		})
	},
}
