import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayer from '../players/ServerPlayer'
import Ruleset from '../Ruleset'
import VoidPlayerInGame from '../utils/VoidPlayerInGame'
import ServerBotPlayer from '../utils/ServerBotPlayer'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const initializedPlayers = game.players.filter(playerInGame => playerInGame.initialized)
		if (initializedPlayers.length < Ruleset.PLAYERS_PER_GAME) {
			return
		}

		game.start()
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		const humanPlayersInGame = game.players.filter(playerInGame => playerInGame !== VoidPlayerInGame.for(game) && !(playerInGame.player instanceof ServerBotPlayer))
		if (humanPlayersInGame.length === 0) {
			const gameLibrary: GameLibrary = global.gameLibrary
			gameLibrary.destroyGame(game)
			return
		}

		if (game.players.length > 1) {
			return
		}

		game.finish(game.players[0], 'Opponent disconnected')
	}
}
