import ServerGame from '../libraries/game/ServerGame'
import OutgoingMessageHandlers from './OutgoingMessageHandlers'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		OutgoingMessageHandlers.sendDeck(playerInGame.player, game)
		if (game.players.length === 2) {
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, game.getOpponent(playerInGame))
		}
		OutgoingMessageHandlers.notifyAboutGameStart(playerInGame.player, game.players.length === 2)
		OutgoingMessageHandlers.sendBoardState(playerInGame.player, game)
		playerInGame.drawCards(10)

		const opponent = game.getOpponent(playerInGame)
		OutgoingMessageHandlers.sendBoardState(opponent.player, game)
	}
}
