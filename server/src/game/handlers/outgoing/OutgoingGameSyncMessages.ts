import ServerPlayer from '../../players/ServerPlayer'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenPlayerInGameMessage from '@shared/models/network/playerInGame/OpenPlayerInGameMessage'
import HiddenPlayerInGameMessage from '@shared/models/network/playerInGame/HiddenPlayerInGameMessage'
import ServerGame from '../../models/ServerGame'
import ServerBoard from '../../models/ServerBoard'
import BoardMessage from '@shared/models/network/BoardMessage'
import ResolveStackMessage from '@shared/models/network/resolveStack/ResolveStackMessage'
import ServerResolveStack from '../../models/ServerResolveStack'
import PlayerInGameRefMessage from '@shared/models/network/playerInGame/PlayerInGameRefMessage'

export default {
	notifyAboutGameStart(player: ServerPlayer, isBoardInverted: boolean): void {
		player.sendMessage({
			type: GameSyncMessageType.START,
			data: new GameStartMessage(isBoardInverted),
		})
	},

	notifyAboutGamePhaseAdvance: (game: ServerGame, phase: GameTurnPhase): void => {
		game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: GameSyncMessageType.PHASE_ADVANCE,
				data: phase,
			})
		})
	},

	sendPlayerSelf: (player: ServerPlayer, self: ServerPlayerInGame): void => {
		player.sendMessage({
			type: GameSyncMessageType.PLAYER_SELF,
			data: new OpenPlayerInGameMessage(self),
		})
	},

	sendPlayerOpponent: (player: ServerPlayer, opponent: ServerPlayerInGame): void => {
		player.sendMessage({
			type: GameSyncMessageType.PLAYER_OPPONENT,
			data: new HiddenPlayerInGameMessage(opponent),
		})
	},

	sendActivePlayer: (player: ServerPlayer, activePlayer: ServerPlayerInGame): void => {
		player.sendMessage({
			type: GameSyncMessageType.ACTIVE_PLAYER,
			data: new PlayerInGameRefMessage(activePlayer),
		})
	},

	sendBoardState: (player: ServerPlayer, board: ServerBoard): void => {
		player.sendMessage({
			type: GameSyncMessageType.BOARD_STATE,
			data: new BoardMessage(board),
		})
	},

	sendStackState: (player: ServerPlayer, resolveStack: ServerResolveStack): void => {
		player.sendMessage({
			type: GameSyncMessageType.STACK_STATE,
			data: new ResolveStackMessage(resolveStack),
		})
	},
}
