import CardType from '../shared/enums/CardType'
import ServerGame from '../models/ServerGame'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'
import MoveOrderMessage from '../shared/models/network/MoveOrderMessage'
import ServerUnitOrder from '../models/ServerUnitOrder'
import UnitOrderMessage from '../shared/models/network/UnitOrderMessage'
import UnitOrderType from '../shared/enums/UnitOrderType'

export default {
	'post/chat': (data: string, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		game.createChatEntry(playerInGame.player, data)
	},

	'post/playCard': (data: CardPlayedMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = player.cardHand.findCardById(data.id)
		if (game.turnPhase !== GameTurnPhase.DEPLOY || !card || !player.canPlayCard(card, data.rowIndex, data.unitIndex)) {
			return
		}

		if (card.cardType === CardType.SPELL) {
			player.playSpell(card)
		} else if (card.cardType === CardType.UNIT) {
			player.playUnit(card, data.rowIndex, data.unitIndex)
		}

		game.advanceTurn()
	},

	'post/unitOrder': (data: UnitOrderMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const orderedUnit = game.board.findCardById(data.orderedUnitId)
		if (game.turnPhase !== GameTurnPhase.SKIRMISH || !orderedUnit || orderedUnit.owner !== player) { return }

		const targetUnit = game.board.findCardById(data.targetUnitId)
		if (data.type === UnitOrderType.ATTACK && targetUnit && orderedUnit.canAttackTarget(targetUnit)) {
			game.board.orders.addToQueue(ServerUnitOrder.attack(orderedUnit, targetUnit))
		}

		const targetRow = game.board.rows[data.targetRowIndex]
		if (data.type === UnitOrderType.MOVE && orderedUnit.canMoveToRow(targetRow)) {
			game.board.orders.addToQueue(ServerUnitOrder.move(orderedUnit, targetRow))
		}
	},

	'post/endTurn': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		if (player.turnEnded) { return }

		if (game.turnPhase === GameTurnPhase.DEPLOY) {
			player.setTimeUnits(0)
		} else if (game.turnPhase === GameTurnPhase.SKIRMISH) {
			player.endTurn()
		} else {
			return
		}

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
