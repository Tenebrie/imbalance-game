import ServerGame from '../libraries/game/ServerGame'
import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import GameLibrary from '../libraries/game/GameLibrary'
import ServerPlayer from '../libraries/players/ServerPlayer'
import GameTurnPhase from '../shared/enums/GameTurnPhase'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const initializedPlayers = game.players.filter(playerInGame => playerInGame.initialized)
		if (initializedPlayers.length < 1) {
			return
		}

		game.start()
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		if (game.players.length === 0 && game.turnPhase === GameTurnPhase.BEFORE_GAME) {
			const gameLibrary: GameLibrary = global.gameLibrary
			gameLibrary.destroyGame(game)
			return
		}

		if (game.players.length !== 1) {
			return
		}

		game.finish('Opponent disconnected')
	}
}
