import CardType from '../shared/enums/CardType'
import GameTurnPhase from '../enums/GameTurnPhase'
import ServerGame from '../libraries/game/ServerGame'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import CardAttackOrderMessage from '../shared/models/network/CardAttackOrderMessage'

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

		if (game.isPlayersFinishedTurn()) {
			game.advanceToCombatPhase()
			if (game.isUnitsFinishedAttacking()) {
				game.advanceToDeployPhase()
			}
		}
	},

	'post/attackOrder': (data: CardAttackOrderMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = game.board.findCardById(data.cardId)
		const target = game.board.findCardById(data.targetId)
		if (game.turnPhase !== GameTurnPhase.COMBAT || !card || !target || card.owner !== player || card.owner === target.owner) {
			return
		}

		game.board.queueCardAttack(card, target)

		if (game.isUnitsFinishedAttacking()) {
			game.advanceToDeployPhase()
		}
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
