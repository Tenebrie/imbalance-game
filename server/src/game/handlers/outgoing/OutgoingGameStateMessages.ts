import ServerGame from '../../models/ServerGame'
import ServerPlayer from '../../players/ServerPlayer'
import GameStartMessage from '../../shared/models/GameStartMessage'
import CardOnBoardMessage from '../../shared/models/network/CardOnBoardMessage'
import CardDeckMessage from '../../shared/models/network/CardDeckMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import HiddenPlayerInGameMessage from '../../shared/models/network/HiddenPlayerInGameMessage'
import PlayerInGameMessage from '../../shared/models/network/PlayerInGameMessage'
import ServerUnitOrder from '../../models/ServerUnitOrder'
import UnitOrderMessage from '../../shared/models/network/UnitOrderMessage'

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

	sendPlayerSelf: (player: ServerPlayer, self: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/player/self',
			data: PlayerInGameMessage.fromPlayerInGame(self)
		})
	},

	sendPlayerOpponent: (player: ServerPlayer, opponent: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/player/opponent',
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

	sendUnitOrders(player: ServerPlayer, orders: ServerUnitOrder[]) {
		const ordersByPlayer = orders.filter(order => order.orderedUnit.owner.player === player)
		const orderMessages = ordersByPlayer.map(order => new UnitOrderMessage(order))
		player.sendMessage({
			type: 'gameState/board/orders',
			data: orderMessages
		})
	}
}
