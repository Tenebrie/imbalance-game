import CardType from '@shared/enums/CardType'
import ServerGame from '../models/ServerGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import ServerCardTarget from '../models/ServerCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import ServerOwnedCard from '../models/ServerOwnedCard'
import {
	ClientToServerMessageTypes,
	GenericActionMessageType,
	SystemMessageType
} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'

export type IncomingMessageHandlerFunction = (data: any, game: ServerGame, playerInGame: ServerPlayerInGame) => void

const IncomingMessageHandlers: {[ index in ClientToServerMessageTypes ]: IncomingMessageHandlerFunction } = {
	[GenericActionMessageType.CARD_PLAY]: (data: CardPlayedMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		const card = playerInGame.cardHand.findCardById(data.id)
		if (!card) {
			return
		}

		if (playerInGame.turnEnded || playerInGame.roundEnded || playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY || !playerInGame.game.board.isExtraUnitPlayableToRow(data.rowIndex) ||
			(card.type === CardType.UNIT && !playerInGame.canPlayUnit(card, data.rowIndex)) ||
			(card.type === CardType.SPELL && !playerInGame.canPlaySpell(card, data.rowIndex))) {

			OutgoingMessageHandlers.notifyAboutCardPlayDeclined(playerInGame.player, card)
			return
		}

		const ownedCard = new ServerOwnedCard(card, playerInGame)
		game.cardPlay.playCard(ownedCard, data.rowIndex, data.unitIndex)

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		game.events.flushLogEventGroup()
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
	},

	[GenericActionMessageType.CARD_TARGET]: (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame): void => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromMessage(game, data)
		game.cardPlay.selectCardTarget(playerInGame, target)

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		game.events.flushLogEventGroup()
	},

	[GenericActionMessageType.TURN_END]: (data: void, game: ServerGame, player: ServerPlayerInGame): void => {
		if (player.turnEnded || player.targetRequired) { return }

		player.endTurn()
		if (player.unitMana > 0) {
			player.setUnitMana(0)
			player.endRound()
		}

		game.advanceCurrentTurn()
		game.events.flushLogEventGroup()
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
