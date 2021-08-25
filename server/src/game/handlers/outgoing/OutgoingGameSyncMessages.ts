import ServerPlayer from '../../players/ServerPlayer'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenPlayerInGameMessage from '@shared/models/network/playerInGame/OpenPlayerInGameMessage'
import ServerGame from '../../models/ServerGame'
import ServerBoard from '../../models/ServerBoard'
import BoardMessage from '@shared/models/network/BoardMessage'
import ResolveStackMessage from '@shared/models/network/resolveStack/ResolveStackMessage'
import ServerResolveStack from '../../models/ServerResolveStack'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'
import { isCardPublic } from '@src/utils/Utils'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import HiddenPlayerInGameMessage from '@shared/models/network/playerInGame/HiddenPlayerInGameMessage'
import PlayersInLobbyMessage from '@shared/models/network/PlayersInLobbyMessage'

export default {
	broadcastPlayersInLobby(game: ServerGame): void {
		const slotsOpen = game.players.reduce((total, playerGroup) => total + playerGroup.openHumanSlots, 0)
		const slotsTotal = game.ruleset.slots.totalPlayerSlots(game)
		const allPlayers = game.allPlayers.filter((player) => player.isHuman).map((playerInGame) => playerInGame.player)
		const message = new PlayersInLobbyMessage(slotsOpen, slotsTotal, allPlayers)

		allPlayers.forEach((player) => {
			player.sendMessage({
				type: GameSyncMessageType.PLAYER_SLOTS,
				data: message,
				highPriority: true,
			})
		})
	},

	notifyAboutGameStart(playerGroup: ServerPlayerGroup, isBoardInverted: boolean): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: GameSyncMessageType.START,
				data: new GameStartMessage(isBoardInverted),
			})
		)
	},

	notifyAboutGameStartForPlayer(player: ServerPlayer, isBoardInverted: boolean): void {
		player.sendMessage({
			type: GameSyncMessageType.START,
			data: new GameStartMessage(isBoardInverted),
		})
	},

	notifyAboutGamePhaseAdvance: (game: ServerGame, phase: GameTurnPhase): void => {
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendMessage({
					type: GameSyncMessageType.PHASE_ADVANCE,
					data: phase,
				})
			})
	},

	sendPlayers: (player: ServerPlayer, self: ServerPlayerInGame): void => {
		const allies = self.group.players.filter((player) => player !== self)
		const opponents = self.group.opponent.players
		player.sendMessage({
			type: GameSyncMessageType.PLAYER_SELF,
			data: new OpenPlayerInGameMessage(self),
			highPriority: true,
		})
		player.sendMessage({
			type: GameSyncMessageType.PLAYER_ALLIES,
			data: allies.map((ally) => new OpenPlayerInGameMessage(ally)),
			highPriority: true,
		})
		player.sendMessage({
			type: GameSyncMessageType.PLAYER_OPPONENTS,
			data: opponents.map((opponent) => new HiddenPlayerInGameMessage(opponent)),
			highPriority: true,
		})
		opponents
			.flatMap((playerInGame) => playerInGame.cardHand.allCards)
			.filter((card) => isCardPublic(card))
			.forEach((card) => {
				OutgoingMessageHandlers.notifyAboutCardRevealedForPlayer(player, card)
			})
	},

	sendActivePlayerGroup: (player: ServerPlayer, activeGroup: ServerPlayerGroup): void => {
		player.sendMessage({
			type: GameSyncMessageType.ACTIVE_PLAYER,
			data: new PlayerGroupRefMessage(activeGroup),
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
