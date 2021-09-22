import GameTurnPhase from '@shared/enums/GameTurnPhase'
import BoardMessage from '@shared/models/network/BoardMessage'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'
import HiddenPlayerInGameMessage from '@shared/models/network/playerInGame/HiddenPlayerInGameMessage'
import OpenPlayerInGameMessage from '@shared/models/network/playerInGame/OpenPlayerInGameMessage'
import PlayersInLobbyMessage from '@shared/models/network/PlayersInLobbyMessage'
import ResolveStackMessage from '@shared/models/network/resolveStack/ResolveStackMessage'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { isCardPublic } from '@src/utils/Utils'

import ServerBoard from '../../models/ServerBoard'
import ServerGame from '../../models/ServerGame'
import ServerResolveStack from '../../models/ServerResolveStack'
import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'

export default {
	broadcastPlayersInLobby(game: ServerGame): void {
		const slotsOpen = game.players.reduce((total, playerGroup) => total + playerGroup.openHumanSlots, 0)
		const slotsTotal = game.ruleset.slots.totalHumanSlots(game)
		const allPlayers = game.allPlayers.filter((player) => player.isHuman).map((playerInGame) => playerInGame.player)
		const message = new PlayersInLobbyMessage(slotsOpen, slotsTotal, allPlayers)

		allPlayers.forEach((player) => {
			player.sendGameMessage({
				type: GameSyncMessageType.PLAYER_SLOTS,
				data: message,
				skipQueue: true,
			})
		})
	},

	notifyAboutGameStart(playerGroup: ServerPlayerGroup, isBoardInverted: boolean): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: GameSyncMessageType.START,
				data: new GameStartMessage(isBoardInverted),
			})
		)
	},

	notifyAboutGameStartForPlayer(player: ServerPlayer, isBoardInverted: boolean): void {
		player.sendGameMessage({
			type: GameSyncMessageType.START,
			data: new GameStartMessage(isBoardInverted),
		})
	},

	notifyAboutGamePhaseAdvance: (game: ServerGame, phase: GameTurnPhase): void => {
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendGameMessage({
					type: GameSyncMessageType.PHASE_ADVANCE,
					data: phase,
				})
			})
	},

	sendPlayers: (player: ServerPlayer, self: ServerPlayerInGame): void => {
		const allies = self.group.players.filter((player) => player !== self)
		const opponents = self.group.opponent.players
		player.sendGameMessage({
			type: GameSyncMessageType.PLAYER_SELF,
			data: new OpenPlayerInGameMessage(self),
			skipQueue: true,
		})
		player.sendGameMessage({
			type: GameSyncMessageType.PLAYER_ALLIES,
			data: allies.map((ally) => new OpenPlayerInGameMessage(ally)),
			skipQueue: true,
		})
		player.sendGameMessage({
			type: GameSyncMessageType.PLAYER_OPPONENTS,
			data: opponents.map((opponent) => new HiddenPlayerInGameMessage(opponent)),
			skipQueue: true,
		})
		opponents
			.flatMap((playerInGame) => playerInGame.cardHand.allCards)
			.filter((card) => isCardPublic(card))
			.forEach((card) => {
				OutgoingMessageHandlers.notifyAboutCardRevealedForPlayer(player, card)
			})
	},

	sendActivePlayerGroup: (player: ServerPlayer, activeGroup: ServerPlayerGroup): void => {
		player.sendGameMessage({
			type: GameSyncMessageType.ACTIVE_PLAYER,
			data: new PlayerGroupRefMessage(activeGroup),
		})
	},

	sendBoardState: (player: ServerPlayer, board: ServerBoard): void => {
		player.sendGameMessage({
			type: GameSyncMessageType.BOARD_STATE,
			data: new BoardMessage(board),
		})
	},

	sendStackState: (player: ServerPlayer, resolveStack: ServerResolveStack): void => {
		player.sendGameMessage({
			type: GameSyncMessageType.STACK_STATE,
			data: new ResolveStackMessage(resolveStack),
		})
	},
}
