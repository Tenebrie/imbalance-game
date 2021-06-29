import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import store from '@/Vue/store'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import BoardMessage from '@shared/models/network/BoardMessage'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ResolveStackMessage from '@shared/models/network/resolveStack/ResolveStackMessage'
import RenderedBuff from '@/Pixi/models/buffs/RenderedBuff'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'

const IncomingGameSyncMessages: { [index in GameSyncMessageType]: IncomingMessageHandlerFunction } = {
	[GameSyncMessageType.START]: (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
		store.dispatch.gameStateModule.startGame()
	},

	[GameSyncMessageType.PHASE_ADVANCE]: (data: GameTurnPhase) => {
		store.commit.gameStateModule.setTurnPhase(data)
	},

	[GameSyncMessageType.PLAYER_SELF]: (data: PlayerInGameMessage) => {
		Core.player.addPlayer(data)
	},

	[GameSyncMessageType.PLAYER_ALLIES]: (data: PlayerInGameMessage[]) => {
		data.forEach((player) => {
			Core.player.addPlayer(player)
		})
	},

	[GameSyncMessageType.PLAYER_OPPONENTS]: (data: PlayerInGameMessage[]) => {
		data.forEach((player) => {
			Core.opponent.addPlayer(player)
			store.commit.gameStateModule.setOpponentData(player.player)
			store.commit.gameStateModule.setOpponentSpellMana(player.spellMana)
		})
	},

	[GameSyncMessageType.BOARD_STATE]: (data: BoardMessage) => {
		Core.board.clearBoard()
		data.rows.forEach((rowMessage) => {
			const row = Core.board.rows[rowMessage.index]
			row.owner = Core.getPlayerGroupOrNull(rowMessage.ownerId)
			row.cards = rowMessage.cards.map((unit) => new RenderedUnit(RenderedCard.fromMessage(unit.card), Core.getPlayerGroup(unit.ownerId)))
			rowMessage.buffs.buffs.forEach((buffMessage) => {
				row.buffs.add(new RenderedBuff(row.buffs, buffMessage))
			})
		})
	},

	[GameSyncMessageType.STACK_STATE]: (data: ResolveStackMessage) => {
		data.entries.forEach((entry) => {
			Core.resolveStack.addCard(RenderedCard.fromMessage(entry.ownedCard.card), Core.getPlayer(entry.ownedCard.owner.playerId))
		})
	},

	[GameSyncMessageType.ACTIVE_PLAYER]: (data: PlayerGroupRefMessage) => {
		const group = Core.getPlayerGroupOrNull(data.id)
		if (!group) {
			throw new Error(`Unable to find player group with id ${data.id}`)
		}
		group.startTurn()
	},
}

export default IncomingGameSyncMessages
