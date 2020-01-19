import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayer from '../players/ServerPlayer'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import Ruleset from '../Ruleset'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const initializedPlayers = game.players.filter(playerInGame => playerInGame.initialized)
		if (initializedPlayers.length < Ruleset.PLAYERS_PER_GAME) {
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
