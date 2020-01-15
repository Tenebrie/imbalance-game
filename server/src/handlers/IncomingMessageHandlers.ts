import CardType from '../shared/enums/CardType'
import ServerGame from '../libraries/game/ServerGame'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import AttackOrderMessage from '../shared/models/network/AttackOrderMessage'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'

export default {
	'post/chat': (data: string, game: ServerGame, playerInGame: ServerPlayerInGame) => {
		game.createChatEntry(playerInGame.player, data)
	},

	'post/playCard': (data: CardPlayedMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = player.cardHand.findCardById(data.id)
		if (game.turnPhase !== GameTurnPhase.DEPLOY || !card || !player.canPlayCard(card)) { return }

		if (card.cardType === CardType.SPELL) {
			player.playSpell(game, card)
		} else if (card.cardType === CardType.UNIT) {
			player.playUnit(game, card, data.rowIndex, data.unitIndex)
		}

		if (game.isDeployPhaseFinished()) {
			game.advancePhase()
			if (game.isSkirmishPhaseFinished()) {
				game.advancePhase()
			}
		}
	},

	'post/attackOrder': (data: AttackOrderMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = game.board.findCardById(data.attackerId)
		const target = game.board.findCardById(data.targetId)
		if (game.turnPhase !== GameTurnPhase.SKIRMISH || !card || !target || card.owner !== player || card.owner === target.owner) {
			console.log('Denying card attack order')
			return
		}

		game.board.queueCardAttack(card, target)

		if (game.isSkirmishPhaseFinished()) {
			game.advancePhase()
		}
	},

	'post/endTurn': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		player.endTurn()

		if ((game.turnPhase === GameTurnPhase.DEPLOY && game.isDeployPhaseFinished()) || (game.turnPhase === GameTurnPhase.SKIRMISH && game.isSkirmishPhaseFinished())) {
			game.advancePhase()
		}
	},

	'system/init': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		player.initialized = true
		ConnectionEstablishedHandler.onPlayerConnected(game, player)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
