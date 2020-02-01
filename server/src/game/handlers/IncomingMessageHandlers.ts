import CardType from '../shared/enums/CardType'
import ServerGame from '../models/ServerGame'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import ServerUnitOrder from '../models/ServerUnitOrder'
import UnitOrderMessage from '../shared/models/network/UnitOrderMessage'
import UnitOrderType from '../shared/enums/UnitOrderType'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'

export default {
	'post/chat': (data: string, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		game.createChatEntry(playerInGame.player, data)
	},

	'post/playCard': (data: CardPlayedMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = player.cardHand.findCardById(data.id)
		if (player.turnEnded || game.turnPhase !== GameTurnPhase.DEPLOY || !card || (card.cardType === CardType.SPELL && !player.canPlaySpell(card)) || (card.cardType === CardType.UNIT && !player.canPlayUnit(card, data.rowIndex, data.unitIndex))) {
			return
		}

		if (card.cardType === CardType.SPELL) {
			player.playSpell(card)
		} else if (card.cardType === CardType.UNIT) {
			player.playUnit(card, data.rowIndex, data.unitIndex)
		}

		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(game, player)
		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(game, game.getOpponent(player))

		if (!player.isAnyActionsAvailable()) {
			player.endTurn()
			game.advanceTurn()
		}
	},

	'post/unitOrder': (data: UnitOrderMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const orderedUnit = game.board.findCardById(data.orderedUnitId)
		if (player.turnEnded || game.turnPhase !== GameTurnPhase.DEPLOY || !orderedUnit || orderedUnit.owner !== player || orderedUnit.hasSummoningSickness) { return }

		const targetUnit = game.board.findCardById(data.targetUnitId)
		if (data.type === UnitOrderType.ATTACK && targetUnit && orderedUnit.canAttackTarget(targetUnit)) {
			game.board.orders.performUnitOrder(ServerUnitOrder.attack(orderedUnit, targetUnit))
		}

		const targetRow = game.board.rows[data.targetRowIndex]
		if (data.type === UnitOrderType.MOVE && orderedUnit.canMoveToRow(targetRow)) {
			game.board.orders.performUnitOrder(ServerUnitOrder.move(orderedUnit, targetRow))
		}

		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(game, player)
		OutgoingMessageHandlers.notifyAboutOpponentUnitValidOrdersChanged(game, game.getOpponent(player))

		if (!player.isAnyActionsAvailable()) {
			player.endTurn()
			game.advanceTurn()
		}
	},

	'post/endTurn': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		if (player.turnEnded) { return }

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
