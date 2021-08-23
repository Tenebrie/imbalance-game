import ServerGame, { OptionalGameProps } from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { colorizeConsoleText, colorizeId, colorizePlayer } from '@src/utils/Utils'
import { RulesetChain } from '@src/game/models/rulesets/RulesetChain'
import RulesetCategory from '@shared/enums/RulesetCategory'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'

class GameLibrary {
	games: ServerGame[]

	constructor() {
		this.games = []
	}

	public createGame(owner: ServerPlayer, ruleset: RulesetConstructor, props: Partial<OptionalGameProps> = {}): ServerGame {
		let game: ServerGame
		const rulesetTemplate = RulesetLibrary.findTemplate(ruleset)
		if (rulesetTemplate.category === RulesetCategory.LABYRINTH) {
			game = ServerGame.newOwnedInstance(owner, ruleset, props)
			console.info(`Player ${colorizePlayer(owner.username)} created owned game ${colorizeId(game.id)}`)
		} else {
			game = ServerGame.newPublicInstance(ruleset, props)
			console.info(`Player ${colorizePlayer(owner.username)} created public game ${colorizeId(game.id)}`)
		}

		this.games.push(game)
		return game
	}

	public createChainGame(fromGame: ServerGame, chain: RulesetChain): ServerGame {
		const newGame = ServerGame.newOwnedInstance(fromGame.owner!, chain.get(fromGame), {})
		this.games.push(newGame)

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
			.flatMap((playerGroup) => playerGroup.players)
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
