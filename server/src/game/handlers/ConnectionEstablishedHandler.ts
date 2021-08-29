import TargetMode from '@shared/enums/TargetMode'
import { sortCards } from '@shared/Utils'
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
		OutgoingMessageHandlers.notifyAboutGameStartForPlayer(playerInGame.player, playerInGame.isInvertedBoard())
		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueueForPlayer(game, playerInGame.player)
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		console.info(`Player ${colorizePlayer(player.username)} has disconnected from game ${colorizeId(game.id)}.`)
		player.spectators.forEach((spectator) => spectator.player.disconnect())

		const connectedPlayers = game.humanPlayers.filter((player) => player.player.isInGame())
		if (connectedPlayers.length === 1) {
			console.info(`Only one player left in game ${colorizeId(game.id)}. It will be shutdown in 60 seconds.`)
			game.timers.playerLeaveTimeout.start()
		}
		if (connectedPlayers.length === 0 && !game.isStarted) {
			game.finish(null, 'No players left')
		} else if (connectedPlayers.length === 0 && game.isStarted && game.allPlayers.some((player) => player.isBot)) {
			console.info(`No players left in game ${colorizeId(game.id)}. It will be shutdown in 60 seconds.`)
			game.timers.playerLeaveTimeout.start()
		}
	},

	onSpectatorConnected(game: ServerGame, spectator: ServerPlayerSpectator): void {
		const spectatedPlayerInGame = spectator.spectatedPlayer.playerInGame
		if (!spectatedPlayerInGame) {
			spectator.player.disconnect()
			return
		}
		const opponent = spectatedPlayerInGame.opponent
		if (!opponent) {
			spectator.player.disconnect()
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
		OutgoingMessageHandlers.notifyAboutGameStartForPlayer(spectator.player, spectatedPlayerInGame.isInvertedBoard())
		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueueForPlayer(game, spectator.player)
	},
}
