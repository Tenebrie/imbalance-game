import ServerGame from '../models/ServerGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import ServerCardTarget from '../models/ServerCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import ServerOwnedCard from '../models/ServerOwnedCard'
import {ClientToServerMessageTypes, GenericActionMessageType, SystemMessageType} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import TargetMode from '@shared/enums/TargetMode'
import Utils from '../../utils/Utils'
import CardLibrary from '../libraries/CardLibrary'
import TokenEmptyDeck from '../cards/09-neutral/tokens/TokenEmptyDeck'

export type IncomingMessageHandlerFunction = (data: any, game: ServerGame, playerInGame: ServerPlayerInGame) => void

const IncomingMessageHandlers: {[ index in ClientToServerMessageTypes ]: IncomingMessageHandlerFunction } = {
	[GenericActionMessageType.CARD_PLAY]: (data: CardPlayedMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const card = playerInGame.cardHand.findCardById(data.id)
		if (!card) {
			return
		}

		const validTargets = card.targeting.getValidCardPlayTargets(card.owner)
		if (playerInGame.turnEnded || playerInGame.roundEnded || playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY || !validTargets.find(target => data.rowIndex === target.targetRow.index)) {
			OutgoingMessageHandlers.notifyAboutCardPlayDeclined(playerInGame.player, card)
			return
		}

		const ownedCard = new ServerOwnedCard(card, playerInGame)
		game.cardPlay.playCard(ownedCard, data.rowIndex, data.unitIndex)

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.UNIT_ORDER]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const orderedUnit = game.board.findUnitById(data.sourceCardId)
		if (playerInGame.turnEnded || playerInGame.targetRequired || game.turnPhase !== GameTurnPhase.DEPLOY || !orderedUnit || orderedUnit.owner !== playerInGame) {
			return
		}

		game.board.orders.performUnitOrder(ServerCardTarget.fromMessage(game, data))

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.CARD_TARGET]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromMessage(game, data)
		if (game.cardPlay.cardResolveStack.currentCard) {
			game.cardPlay.selectCardTarget(playerInGame, target)
		} else {
			game.cardPlay.selectPlayerMulliganTarget(playerInGame, target)
		}

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.CONFIRM_TARGETS]: (data: TargetMode, game: ServerGame, player: ServerPlayerInGame): void => {
		if (data !== TargetMode.MULLIGAN && player.mulliganMode) {
			player.showMulliganCards()
		} else if (data === TargetMode.BROWSE) {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(player.player, TargetMode.BROWSE, [])
		} else if (data === TargetMode.MULLIGAN && player.mulliganMode) {
			player.finishMulligan()
			game.advanceMulliganPhase()
			game.events.flushLogEventGroup()
		}

		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_DECK]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.cardDeck.unitCards.concat(player.cardDeck.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map(card => ServerCardTarget.playerTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.cardGraveyard.unitCards.concat(player.cardGraveyard.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map(card => ServerCardTarget.playerTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedTargets(player.player, TargetMode.BROWSE, targets)
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		const cards = Utils.sortCards(player.opponent.cardGraveyard.unitCards.concat(player.opponent.cardGraveyard.spellCards))
		if (cards.length === 0) {
			cards.push(CardLibrary.findPrototypeByConstructor(TokenEmptyDeck))
		}
		const targets = cards.map(card => ServerCardTarget.playerTargetCardInUnitDeck(TargetMode.BROWSE, card))
		OutgoingMessageHandlers.notifyAboutRequestedTargets(player.player, TargetMode.BROWSE, targets)
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
		game.events.flushLogEventGroup()
		OutgoingMessageHandlers.executeMessageQueue(game)
	},

	[SystemMessageType.INIT]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.initialized) {
			return
		}
		player.initialized = true
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	[SystemMessageType.KEEPALIVE]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		// No action needed
	}
}

export default IncomingMessageHandlers
