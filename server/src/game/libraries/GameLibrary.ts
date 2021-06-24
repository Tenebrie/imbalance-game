import ServerGame, { OptionalGameProps } from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { colorizeConsoleText, colorizeId, colorizePlayer } from '@src/utils/Utils'
import { ServerRulesetTemplate } from '../models/rulesets/ServerRuleset'

class GameLibrary {
	games: ServerGame[]

	constructor() {
		this.games = []
	}

	public createOwnedGame(owner: ServerPlayer, name: string, ruleset: ServerRulesetTemplate, props: OptionalGameProps): ServerGame {
		const game = ServerGame.newOwnedInstance(owner, name, ruleset, props)
		console.info(`Player ${colorizePlayer(owner.username)} created game ${colorizeId(game.id)}`)

		this.games.push(game)
		return game
	}

	public createChainGame(fromGame: ServerGame): ServerGame {
		const newGame = ServerGame.newOwnedInstance(fromGame.owner!, fromGame.name, fromGame.ruleset.chain!.get(), {})
		this.games.push(newGame)
		fromGame.players.forEach((player) => newGame.addPlayer(player.player, player.startingDeck))
		return newGame
	}

	public destroyGame(game: ServerGame, reason: string): void {
		if (!this.games.includes(game)) {
			return
		}

		console.info(`Destroying game ${colorizeId(game.id)}. Reason: ${colorizeConsoleText(reason)}`)

		game.spectators
			.filter((spectator) => spectator.player.webSocket && spectator.player.webSocket.game === game)
			.forEach((spectator) => {
				OutgoingMessageHandlers.notifyAboutGameShutdown(spectator.player)
				spectator.player.disconnect()
			})
		game.players
			.filter((playerInGame) => playerInGame.player.webSocket && playerInGame.player.webSocket.game === game)
			.forEach((playerInGame) => {
				OutgoingMessageHandlers.notifyAboutGameShutdown(playerInGame.player)
				playerInGame.player.disconnect()
			})
		this.games.splice(this.games.indexOf(game), 1)
	}

	public destroyOwnedGame(id: string, player: ServerPlayer, reason: string): void {
		if (!id) {
			throw 'Missing game ID'
		}

		const game = this.games.find((game) => game.id === id)
		if (!game || !game.owner || game.owner.id !== player.id) {
			throw 'Invalid game ID'
		}

		this.destroyGame(game, reason)
	}
}

export default new GameLibrary()
