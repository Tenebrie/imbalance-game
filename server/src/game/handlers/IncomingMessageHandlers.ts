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

export default {
	'post/chat': (data: string, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		game.createChatEntry(playerInGame.player, data)
	},

	'post/playCard': (data: CardPlayedMessage, game: ServerGame, playerInGame: ServerPlayerInGame) => {
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

		if (!playerInGame.isAnyActionsAvailable()) {
			playerInGame.endTurn()
			game.advanceCurrentTurn()
		}
		game.events.flushLogEventGroup()
	},

	'post/unitOrder': (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		const orderedUnit = game.board.findUnitById(data.sourceUnitId)
		if (playerInGame.turnEnded || playerInGame.targetRequired || game.turnPhase !== GameTurnPhase.DEPLOY || !orderedUnit || orderedUnit.owner !== playerInGame) {
			return
		}

		game.board.orders.performUnitOrder(ServerCardTarget.fromMessage(game, data))

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		if (!playerInGame.isAnyActionsAvailable()) {
			playerInGame.endTurn()
			game.advanceCurrentTurn()
		}
		game.events.flushLogEventGroup()
	},

	'post/cardTarget': (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromMessage(game, data)
		game.cardPlay.selectCardTarget(playerInGame, target)

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(game)

		if (!playerInGame.isAnyActionsAvailable()) {
			playerInGame.endTurn()
			game.advanceCurrentTurn()
		}
		game.events.flushLogEventGroup()
	},

	'post/endTurn': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		if (player.turnEnded || player.targetRequired) { return }

		player.endTurn()
		if (player.unitMana > 0) {
			player.setUnitMana(0)
			player.endRound()
		}

		game.advanceCurrentTurn()
		game.events.flushLogEventGroup()
	},

	'system/init': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		if (player.initialized) {
			return
		}
		player.initialized = true
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
