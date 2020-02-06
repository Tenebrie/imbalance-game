import CardType from '../shared/enums/CardType'
import ServerGame from '../models/ServerGame'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import ServerCardTarget from '../models/ServerCardTarget'
import CardTargetMessage from '../shared/models/network/CardTargetMessage'
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

		if (playerInGame.turnEnded || playerInGame.targetRequired ||
			game.turnPhase !== GameTurnPhase.DEPLOY ||
			(card.cardType === CardType.SPELL && !playerInGame.canPlaySpell(card)) ||
			(card.cardType === CardType.UNIT && !playerInGame.canPlayUnit(card, data.rowIndex, data.unitIndex))) {

			OutgoingMessageHandlers.notifyAboutCardPlayDeclined(playerInGame.player, card)
			return
		}

		const ownedCard = new ServerOwnedCard(card, playerInGame)
		game.cardPlay.playCard(ownedCard, data.rowIndex, data.unitIndex)

		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(game, playerInGame)
		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(game, game.getOpponent(playerInGame))

		if (!playerInGame.isAnyActionsAvailable()) {
			playerInGame.endTurn()
			game.advanceTurn()
		}
	},

	'post/unitOrder': (data: CardTargetMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const orderedUnit = game.board.findUnitById(data.sourceUnitId)
		if (player.turnEnded || player.targetRequired || game.turnPhase !== GameTurnPhase.DEPLOY || !orderedUnit || orderedUnit.owner !== player || orderedUnit.hasSummoningSickness) {
			return
		}

		game.board.orders.performUnitOrder(ServerCardTarget.fromMessage(game, data))

		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(game, player)
		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(game, game.getOpponent(player))

		if (!player.isAnyActionsAvailable()) {
			player.endTurn()
			game.advanceTurn()
		}
	},

	'post/cardTarget': (data: CardTargetMessage, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		if (!playerInGame.targetRequired) {
			return
		}

		const target = ServerCardTarget.fromMessage(game, data)
		game.cardPlay.selectCardTarget(playerInGame, target)

		if (!playerInGame.isAnyActionsAvailable()) {
			playerInGame.endTurn()
			game.advanceTurn()
		}
	},

	'post/endTurn': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		if (player.turnEnded || player.targetRequired) { return }

		player.setTimeUnits(0)
		player.endTurn()

		game.advanceTurn()
	},

	'system/init': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		player.initialized = true
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
