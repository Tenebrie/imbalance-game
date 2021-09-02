import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import {
	ClientToServerMessageTypes,
	GenericActionMessageType,
	SystemMessageType,
} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import { sortCards } from '@shared/Utils'
import NovelReplyMessage from '@src/../../shared/src/models/novel/NovelReplyMessage'
import ServerCardTarget from '@src/game/models/ServerCardTarget'

import CardLibrary from '../libraries/CardLibrary'
import ServerGame from '../models/ServerGame'
import ServerOwnedCard from '../models/ServerOwnedCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

export type IncomingMessageHandlerFunction = (data: any, game: ServerGame, playerInGame: ServerPlayerInGame) => void

const onPlayerActionEnd = (game: ServerGame, player: ServerPlayerInGame): void => {
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

const IncomingMessageHandlers: { [index in ClientToServerMessageTypes]: IncomingMessageHandlerFunction } = {
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
		OutgoingMessageHandlers.executeMessageQueue(game)
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
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.CARD_TARGET]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		game.cardPlay.selectCardTarget(playerInGame, data)

		onPlayerActionEnd(game, playerInGame)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.ANONYMOUS_TARGET]: (data: AnonymousTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromAnonymousMessage(game, data)
		game.cardPlay.selectPlayerMulliganTarget(playerInGame, target)

		onPlayerActionEnd(game, playerInGame)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.CONFIRM_TARGETS]: (data: TargetMode, game: ServerGame, player: ServerPlayerInGame): void => {
		if (data !== TargetMode.MULLIGAN && player.group.mulliganMode) {
			player.showMulliganCards()
		} else if (data === TargetMode.BROWSE) {
			OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, [])
		} else if (data === TargetMode.MULLIGAN && player.group.mulliganMode) {
			player.finishMulligan()
			game.advanceMulliganPhase()
			onPlayerActionEnd(game, player)
		}

		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_DECK]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = sortCards(player.cardDeck.unitCards.concat(player.cardDeck.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeFromClass('tokenEmptyDeck'))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = sortCards(player.cardGraveyard.unitCards.concat(player.cardGraveyard.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeFromClass('tokenEmptyDeck'))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = sortCards(
			player.opponentNullable!.players[0].cardGraveyard.unitCards.concat(player.opponentNullable!.players[0].cardGraveyard.spellCards)
		)
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeFromClass('tokenEmptyDeck'))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.NOVEL_REPLY]: (data: NovelReplyMessage, game: ServerGame, player: ServerPlayerInGame): void => {
		game.novel.executeReply(data.id)
		onPlayerActionEnd(game, player)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.TURN_END]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.group.turnEnded || player.targetRequired) {
			return
		}

		player.group.endRound()

		game.advanceCurrentTurn()
		onPlayerActionEnd(game, player)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.SURRENDER]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (!game.isStarted || game.isFinished) {
			return
		}

		game.finish(player.opponentNullable, 'Player surrendered (Player action)')
		onPlayerActionEnd(game, player)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[SystemMessageType.INIT]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.initialized) {
			return
		}
		player.initialized = true
		game.events.resolveEvents()
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	[SystemMessageType.KEEPALIVE]: (data: void, game: ServerGame): void => {
		OutgoingMessageHandlers.executeMessageQueue(game)
	},
}

export default IncomingMessageHandlers
