import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerPlayer from '../players/ServerPlayer'
import ServerBotPlayer from '../AI/ServerBotPlayer'
import Constants from '@shared/Constants'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import Utils, {isCardPublic} from '../../utils/Utils'
import ServerCardTarget from '../models/ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const initializedPlayers = game.players.filter(playerInGame => playerInGame.initialized)
		if (initializedPlayers.length < Constants.PLAYERS_PER_GAME) {
			return
		}

		game.start()
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		player.spectators.forEach(spectator => spectator.player.disconnect())
		const humanPlayersInGame = game.players.filter(playerInGame => !(playerInGame.player instanceof ServerBotPlayer))
		if (humanPlayersInGame.length === 0) {
			game.forceShutdown('No human players left')
			return
		}

		if (game.players.length === 1) {
			game.finish(game.players[0], 'Opponent disconnected')
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
		OutgoingMessageHandlers.sendPlayerSelf(spectator.player, spectatedPlayerInGame)
		OutgoingMessageHandlers.sendPlayerOpponent(spectator.player, opponent)
		opponent.cardHand.allCards.filter(card => isCardPublic(card)).forEach(card => {
			OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(spectator.player, card)
		})
		OutgoingMessageHandlers.notifyAboutDeckLeader(spectator, opponent, spectatedPlayerInGame.leader)
		OutgoingMessageHandlers.sendBoardState(spectator.player, game.board)
		OutgoingMessageHandlers.sendStackState(spectator.player, game.cardPlay.cardResolveStack)
		if (game.activePlayer) {
			OutgoingMessageHandlers.sendActivePlayer(spectator.player, game.activePlayer)
		}
		if (spectatedPlayerInGame.targetRequired && !spectatedPlayerInGame.mulliganMode) {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(spectator.player, TargetMode.DEPLOY_EFFECT, game.cardPlay.getValidTargets())
		} else if (spectatedPlayerInGame.mulliganMode) {
			const cardsToMulligan = spectatedPlayerInGame.cardHand.unitCards
			const targets = Utils.sortCards(cardsToMulligan).map(card => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.MULLIGAN, card))
			OutgoingMessageHandlers.notifyAboutRequestedTargets(spectator.player, TargetMode.MULLIGAN, targets)
		}
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, spectatedPlayerInGame)
		OutgoingMessageHandlers.notifyAboutGameStart(spectator.player, spectatedPlayerInGame.isInvertedBoard())
		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueueForPlayer(game, spectator.player)
	},
}
