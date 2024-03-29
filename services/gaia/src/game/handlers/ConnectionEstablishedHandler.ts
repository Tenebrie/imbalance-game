import TargetMode from '@shared/enums/TargetMode'
import { sortCards } from '@shared/Utils'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import { OutgoingGlobalMessageHandlers } from '@src/game/handlers/OutgoingGlobalMessageHandlers'
import ServerGameTimers from '@src/game/models/ServerGameTimers'
import { colorizeId, colorizePlayer } from '@src/utils/Utils'

import ServerCardTarget from '../models/ServerCardTarget'
import ServerGame from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		if (!game.isStarted) {
			this.onPlayerConnectedInitially(game)
		} else {
			this.onPlayerReconnected(game, playerInGame)
		}
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameUpdated(game)
	},

	onPlayerConnectedInitially(game: ServerGame): void {
		const openPlayerSlots = game.ruleset.slots.openHumanSlots(game)
		if (openPlayerSlots > 0) {
			return
		}

		game.start()
	},

	onPlayerReconnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		console.info(`Player ${colorizePlayer(playerInGame.player.username)} has reconnected to game ${colorizeId(game.id)}.`)
		game.timers.playerLeaveTimeout.stop()

		OutgoingMessageHandlers.sendPlayers(playerInGame.player, playerInGame)
		OutgoingMessageHandlers.sendBoardState(playerInGame.player, game.board)
		OutgoingMessageHandlers.sendStackState(playerInGame.player, game.cardPlay.cardResolveStack)
		if (game.activePlayer) {
			OutgoingMessageHandlers.sendActivePlayerGroup(playerInGame.player, game.activePlayer)
		}
		if (playerInGame.targetRequired && game.cardPlay.cardResolveStack.currentEntry) {
			const cardTargets = game.cardPlay.getResolvingCardTargets()
			OutgoingMessageHandlers.notifyAboutRequestedCardTargetsForReconnect(
				playerInGame.player,
				game.cardPlay.cardResolveStack.currentEntry.targetMode,
				cardTargets.map((deployTarget) => deployTarget.target),
				game.cardPlay.cardResolveStack.currentEntry.ownedCard.card
			)
		} else if (playerInGame.group.mulliganMode) {
			OutgoingMessageHandlers.notifyAboutCardsMulliganed(playerInGame.player, playerInGame)
			const cardsToMulligan = playerInGame.cardHand.unitCards
			const targets = sortCards(cardsToMulligan).map((card) => ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
			OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(playerInGame.player, TargetMode.MULLIGAN, targets)
		}
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, [playerInGame])
		OutgoingMessageHandlers.notifyAboutGamePhaseAdvance(game, game.turnPhase)
		OutgoingMessageHandlers.notifyAboutGameStartForPlayer(playerInGame.player, game.ruleset, playerInGame.isInvertedBoard())
		game.events.flushLogEventGroup()
		game.novel.restoreClientStateOnReconnect(playerInGame)
		OutgoingMessageHandlers.executeMessageQueueForPlayer(game, playerInGame.player)
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		console.info(`Player ${colorizePlayer(player.username)} has disconnected from game ${colorizeId(game.id)}.`)
		player.spectators.forEach((spectator) => spectator.player.disconnectGameSocket())

		const connectedPlayers = game.humanPlayers.filter((player) => player.player.isInGame())
		if (connectedPlayers.length === 1 && game.players[0].isHuman && game.players[1].isHuman) {
			console.info(
				`Only one player left in game ${colorizeId(game.id)}. It will be shutdown in ${
					ServerGameTimers.PLAYER_RECONNECT_TIMEOUT / 1000
				} seconds.`
			)
			game.timers.playerLeaveTimeout.start()
		} else if (connectedPlayers.length === 0 && !game.isStarted) {
			game.systemFinish(null, GameVictoryCondition.CANCELLED)
		} else if (connectedPlayers.length === 0 && game.isStarted && !game.isFinished && game.allPlayers.some((player) => player.isBot)) {
			console.info(
				`No players left in game ${colorizeId(game.id)}. It will be shutdown in ${
					ServerGameTimers.PLAYER_RECONNECT_TIMEOUT / 1000
				} seconds.`
			)
			game.timers.playerLeaveTimeout.start()
		} else if (connectedPlayers.length === 0 && game.isStarted && !game.isFinished && game.allPlayers.every((player) => player.isHuman)) {
			game.systemFinish(null, GameVictoryCondition.ALL_PLAYERS_CONNECTION_LOST)
		}

		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameUpdated(game)
	},

	onSpectatorConnected(game: ServerGame, spectator: ServerPlayerSpectator): void {
		const spectatedPlayerInGame = spectator.spectatedPlayer.playerInGame
		if (!spectatedPlayerInGame) {
			spectator.player.disconnectGameSocket()
			return
		}
		const opponent = spectatedPlayerInGame.opponentNullable
		if (!opponent) {
			spectator.player.disconnectGameSocket()
			return
		}

		OutgoingMessageHandlers.notifyAboutSpectateMode(spectator.player)
		OutgoingMessageHandlers.sendPlayers(spectator.player, spectatedPlayerInGame)
		OutgoingMessageHandlers.sendBoardState(spectator.player, game.board)
		OutgoingMessageHandlers.sendStackState(spectator.player, game.cardPlay.cardResolveStack)
		if (game.activePlayer) {
			OutgoingMessageHandlers.sendActivePlayerGroup(spectator.player, game.activePlayer)
		}
		if (spectatedPlayerInGame.targetRequired && game.cardPlay.cardResolveStack.currentEntry) {
			const cardTargets = game.cardPlay.getResolvingCardTargets()
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				spectator.player,
				game.cardPlay.cardResolveStack.currentEntry.targetMode,
				cardTargets.map((target) => target.target),
				game.cardPlay.cardResolveStack.currentEntry.ownedCard.card
			)
		} else if (spectatedPlayerInGame.group.mulliganMode) {
			OutgoingMessageHandlers.notifyAboutCardsMulliganed(spectator.player, spectatedPlayerInGame)
			const cardsToMulligan = spectatedPlayerInGame.cardHand.unitCards
			const targets = sortCards(cardsToMulligan).map((card) => ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
			OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(spectator.player, TargetMode.MULLIGAN, targets)
		}
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, [spectatedPlayerInGame])
		OutgoingMessageHandlers.notifyAboutGameStartForPlayer(spectator.player, game.ruleset, spectatedPlayerInGame.isInvertedBoard())
		game.events.flushLogEventGroup()
		game.novel.restoreClientStateOnReconnect(spectator)
		OutgoingMessageHandlers.executeMessageQueueForPlayer(game, spectator.player)
	},
}
