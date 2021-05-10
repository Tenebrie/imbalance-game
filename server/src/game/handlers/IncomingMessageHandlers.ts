import ServerGame from '../models/ServerGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import ServerOwnedCard from '../models/ServerOwnedCard'
import {
	ClientToServerMessageTypes,
	GenericActionMessageType,
	SystemMessageType,
} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import TargetMode from '@shared/enums/TargetMode'
import CardLibrary from '../libraries/CardLibrary'
import TokenEmptyDeck from '../cards/09-neutral/tokens/TokenEmptyDeck'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import ServerCardTarget from '@src/game/models/ServerCardTarget'
import Utils from '@src/utils/Utils'

export type IncomingMessageHandlerFunction = (data: any, game: ServerGame, playerInGame: ServerPlayerInGame) => void

const onPlayerActionEnd = (game: ServerGame, player: ServerPlayerInGame): void => {
	game.events.resolveEvents()
	game.events.evaluateSelectors()
	game.events.flushLogEventGroup()

	if (game.turnPhase === GameTurnPhase.DEPLOY && player.unitMana === 0 && game.cardPlay.cardResolveStack.currentCard === null) {
		player.endTurn()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()
	}

	OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, player)
	OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)
	game.events.flushLogEventGroup()
}

const IncomingMessageHandlers: { [index in ClientToServerMessageTypes]: IncomingMessageHandlerFunction } = {
	[GenericActionMessageType.CARD_PLAY]: (data: CardPlayedMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const card = playerInGame.cardHand.findCardById(data.id)
		if (!card) {
			return
		}

		const validTargets = card.targeting.getPlayTargets(card.owner)
		if (
			playerInGame.turnEnded ||
			playerInGame.roundEnded ||
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
			playerInGame.turnEnded ||
			playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY ||
			!orderedUnit ||
			orderedUnit.owner !== playerInGame ||
			!game.board.orders.validOrders.some((validOrder) => validOrder.target.id === data.id)
		) {
			return
		}

		game.board.orders.performUnitOrder(data)

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
		if (data !== TargetMode.MULLIGAN && player.mulliganMode) {
			player.showMulliganCards()
		} else if (data === TargetMode.BROWSE) {
			OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, [])
		} else if (data === TargetMode.MULLIGAN && player.mulliganMode) {
			player.finishMulligan()
			game.advanceMulliganPhase()
			onPlayerActionEnd(game, player)
		}

		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_DECK]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.cardDeck.unitCards.concat(player.cardDeck.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.cardGraveyard.unitCards.concat(player.cardGraveyard.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.opponent!.cardGraveyard.unitCards.concat(player.opponent!.cardGraveyard.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map((card) => ServerCardTarget.anonymousTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.TURN_END]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.turnEnded || player.targetRequired) {
			return
		}

		player.endTurn()
		if (player.unitMana > 0) {
			player.setUnitMana(0)
			player.endRound()
		}

		game.advanceCurrentTurn()
		onPlayerActionEnd(game, player)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.SURRENDER]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (!game.isStarted || game.isFinished) {
			return
		}

		game.finish(player.opponent, 'Player surrendered (Player action)')
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
