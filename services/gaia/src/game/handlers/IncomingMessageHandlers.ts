import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import {
	ClientToServerGameMessageHandlers,
	GenericActionMessageType,
	SystemMessageType,
} from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import OutgoingNovelMessages from '@src/game/handlers/outgoing/OutgoingNovelMessages'
import ServerCardTarget from '@src/game/models/ServerCardTarget'

import ServerGame from '../models/ServerGame'
import ServerOwnedCard from '../models/ServerOwnedCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

const IncomingMessageHandlers: ClientToServerGameMessageHandlers<ServerGame, ServerPlayerInGame> = {
	[GenericActionMessageType.CARD_PLAY]: (data: CardPlayedMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const card = playerInGame.cardHand.findCardById(data.id)
		if (!card) {
			return
		}

		const validTargets = card.targeting.getPlayTargets(playerInGame, { checkMana: true })
		if (
			playerInGame.group.turnEnded ||
			playerInGame.group.roundEnded ||
			playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY ||
			!validTargets.some((wrapper) => wrapper.target.targetRow.index === data.rowIndex && wrapper.target.targetPosition === data.unitIndex)
		) {
			OutgoingMessageHandlers.notifyAboutCardPlayDeclined(playerInGame.player, card)
			return
		}

		const ownedCard = new ServerOwnedCard(card, playerInGame)
		game.cardPlay.playCardAsPlayerAction(ownedCard, data.rowIndex, data.unitIndex)

		onPlayerActionEnd(game, playerInGame)
	},

	[GenericActionMessageType.UNIT_ORDER]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const orderedUnit = game.board.findUnitById(data.sourceCardId)
		if (
			playerInGame.group.turnEnded ||
			playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY ||
			!orderedUnit ||
			orderedUnit.owner !== playerInGame.group ||
			!game.board.orders.validOrders.some((validOrder) => validOrder.target.id === data.id)
		) {
			return
		}

		game.board.orders.performUnitOrderFromMessage(data, playerInGame)

		onPlayerActionEnd(game, playerInGame)
	},

	[GenericActionMessageType.CARD_TARGET]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		game.cardPlay.selectCardTarget(playerInGame, data)

		onPlayerActionEnd(game, playerInGame)
	},

	[GenericActionMessageType.ANONYMOUS_TARGET]: (data: AnonymousTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromAnonymousMessage(game, data)
		game.cardPlay.selectPlayerMulliganTarget(playerInGame, target)

		onPlayerActionEnd(game, playerInGame)
	},

	[GenericActionMessageType.CONFIRM_TARGETS]: (data: TargetMode, game: ServerGame, player: ServerPlayerInGame): void => {
		if (data !== TargetMode.MULLIGAN && player.group.mulliganMode) {
			player.showMulliganCards()
		} else if (data === TargetMode.BROWSE) {
			OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, [])
			if (game.cardPlay.cardResolveStack.currentEntry) {
				const cardTargets = game.cardPlay.getResolvingCardTargets()
				OutgoingMessageHandlers.notifyAboutRequestedCardTargetsForReconnect(
					player.player,
					game.cardPlay.cardResolveStack.currentEntry.targetMode,
					cardTargets.map((deployTarget) => deployTarget.target),
					game.cardPlay.cardResolveStack.currentEntry.ownedCard.card
				)
			}
		} else if (data === TargetMode.MULLIGAN && player.group.mulliganMode) {
			player.finishMulligan()
			game.advanceMulliganPhase()
			onPlayerActionEnd(game, player)
		}
	},

	[GenericActionMessageType.NOVEL_SKIP_CUE_ANIMATION]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		const otherPlayers = game.allPlayers.filter((filteredPlayer) => filteredPlayer !== player)
		const spectators = player.player.spectators
		const targets = [...otherPlayers, ...spectators]
		OutgoingNovelMessages.notifyAboutCueAnimationSkipSync(targets)
	},

	[GenericActionMessageType.NOVEL_NEXT_CUE]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		game.novel.popClientStateCue()

		const otherPlayers = game.allPlayers.filter((filteredPlayer) => filteredPlayer !== player)
		const spectators = player.player.spectators
		const targets = [...otherPlayers, ...spectators]
		OutgoingNovelMessages.notifyAboutNextCueSync(targets)
	},

	[GenericActionMessageType.NOVEL_CHAPTER]: (data: string, game: ServerGame, player: ServerPlayerInGame): void => {
		game.novel.executeChapter(data)
		onPlayerActionEnd(game, player)
	},

	[GenericActionMessageType.NOVEL_CONTINUE]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		game.novel.continueQueue()
		onPlayerActionEnd(game, player)
	},

	[GenericActionMessageType.TURN_END]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.group.turnEnded || player.targetRequired || !!game.novel.clientState) {
			return
		}

		player.group.endRound()
		game.advanceCurrentTurn()

		onPlayerActionEnd(game, player)
	},

	[GenericActionMessageType.SURRENDER]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		if (!game.isStarted || game.isFinished) {
			return
		}

		game.systemFinish(player.opponentNullable, GameVictoryCondition.PLAYER_SURRENDERED)
		onPlayerActionEnd(game, player)
	},

	[SystemMessageType.INIT]: (data: null, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.initialized) {
			return
		}
		player.initialized = true
		game.events.resolveEvents()
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	[SystemMessageType.KEEPALIVE]: (_data: null, _game: ServerGame): void => {
		// Empty
	},
}

export const onPlayerActionEnd = (game: ServerGame, player: ServerPlayerInGame): void => {
	game.events.resolveEvents()
	game.events.evaluateSelectors()
	game.events.flushLogEventGroup()

	const allPlayersHaveNoUnitMana = player.group.players.every((player) => player.unitMana === 0)
	if (
		game.turnPhase === GameTurnPhase.DEPLOY &&
		allPlayersHaveNoUnitMana &&
		game.cardPlay.cardResolveStack.currentCard === null &&
		!player.group.turnEnded
	) {
		player.group.endTurn()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()
	}

	OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, [player])
	OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)
	game.events.flushLogEventGroup()
}

export default IncomingMessageHandlers
