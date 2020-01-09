import CardType from '../shared/enums/CardType'
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
		if (!card) { return }

		if (card.cardType === CardType.SPELL) {
			player.playSpell(game, card)
		} else if (card.cardType === CardType.UNIT) {
			player.playUnit(game, card, data.rowIndex, data.unitIndex)
		}
	},

	'post/attackOrder': (data: CardAttackOrderMessage, game: ServerGame, player: ServerPlayerInGame) => {
		const card = game.board.findCardById(data.cardId)
		const target = game.board.findCardById(data.targetId)
		if (!card || !target || card.owner !== player || card.owner === target.owner) {
			return
		}

		game.board.performCardAttack(game, card, target)
	},

	'system/keepalive': (data: void, game: ServerGame, player: ServerPlayerInGame) => {
		// No action needed
	}
}
