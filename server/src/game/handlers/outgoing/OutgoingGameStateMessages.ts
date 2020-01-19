import ServerGame from '../../models/ServerGame'
import ServerPlayer from '../../players/ServerPlayer'
import GameStartMessage from '../../shared/models/GameStartMessage'
import CardOnBoardMessage from '../../shared/models/network/CardOnBoardMessage'
import CardDeckMessage from '../../shared/models/network/CardDeckMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import HiddenPlayerInGameMessage from '../../shared/models/network/HiddenPlayerInGameMessage'
import AttackOrderMessage from '../../shared/models/network/AttackOrderMessage'
import ServerAttackOrder from '../../models/ServerAttackOrder'

export default {
	notifyAboutGameStart(player: ServerPlayer, isBoardInverted: boolean) {
		player.sendMessage({
			type: 'gameState/start',
			data: new GameStartMessage(isBoardInverted)
		})
	},

	sendDeck: (player: ServerPlayer, game: ServerGame) => {
		const cardDeck = game.getPlayerInGame(player).cardDeck
		player.sendMessage({
			type: 'gameState/deck',
			data: CardDeckMessage.fromDeck(cardDeck)
		})
	},

	sendOpponent: (player: ServerPlayer, opponent: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/opponent',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(opponent)
		})
	},

	sendBoardState: (player: ServerPlayer, game: ServerGame) => {
		const cardMessages = []
		const rows = game.board.rows
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const row = rows[rowIndex]
			for (let unitIndex = 0; unitIndex < row.cards.length; unitIndex++) {
				const cardOnBoard = row.cards[unitIndex]
				cardMessages.push(CardOnBoardMessage.fromCardOnBoardWithIndex(cardOnBoard, rowIndex, unitIndex))
			}
		}

		player.sendMessage({
			type: 'gameState/board',
			data: cardMessages
		})
	},

	sendAttackOrders(player: ServerPlayer, attackOrders: ServerAttackOrder[]) {
		const attacksByPlayer = attackOrders.filter(attackOrder => attackOrder.attacker.owner.player === player)
		const attackMessages = attacksByPlayer.map(attackOrder => AttackOrderMessage.fromAttackOrder(attackOrder))
		player.sendMessage({
			type: 'gameState/board/attacks',
			data: attackMessages
		})
	}
}
