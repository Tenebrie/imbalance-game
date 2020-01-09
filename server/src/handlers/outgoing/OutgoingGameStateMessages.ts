import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import GameStartMessage from '../../shared/models/GameStartMessage'
import CardOnBoardMessage from '../../shared/models/CardOnBoardMessage'
import CardDeckMessage from '../../shared/models/network/CardDeckMessage'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'
import HiddenPlayerInGameMessage from '../../shared/models/network/HiddenPlayerInGameMessage'

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
				cardMessages.push(CardOnBoardMessage.fromCardOnBoard(cardOnBoard, rowIndex, unitIndex))
			}
		}

		player.sendMessage({
			type: 'gameState/board',
			data: cardMessages
		})
	},
}
