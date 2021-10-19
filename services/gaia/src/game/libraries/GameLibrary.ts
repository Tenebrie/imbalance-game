import RulesetCategory from '@shared/enums/RulesetCategory'
import { Time } from '@shared/Utils'
import { OutgoingGlobalMessageHandlers } from '@src/game/handlers/OutgoingGlobalMessageHandlers'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { RulesetChain } from '@src/game/models/rulesets/RulesetChain'
import { colorizeConsoleText, colorizeId, colorizePlayer } from '@src/utils/Utils'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerGame, { OptionalGameProps } from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'

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
		this.startGameTimeoutTimer(game)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameCreated(game)
		return game
	}

	public createChainGame(fromGame: ServerGame, chain: RulesetChain): ServerGame {
		const newGame = ServerGame.newOwnedInstance(fromGame.owner!, chain.get(fromGame), {})
		this.games.push(newGame)
		this.startGameTimeoutTimer(newGame)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameCreated(newGame)

		return newGame
	}

	public createServiceGame(ruleset: RulesetConstructor, props: Partial<OptionalGameProps> = {}): ServerGame {
		const game = ServerGame.newPublicInstance(ruleset, props)
		console.info(`System created public game ${colorizeId(game.id)}`)

		this.games.push(game)
		this.startGameTimeoutTimer(game)
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameCreated(game)
		return game
	}

	public destroyGame(game: ServerGame, reason: string): void {
		if (!this.games.includes(game)) {
			return
		}

		console.info(`Destroying game ${colorizeId(game.id)}. Reason: ${colorizeConsoleText(reason)}`)

		game.spectators
			.filter((spectator) => spectator.player.gameWebSocket && spectator.player.gameWebSocket.game === game)
			.forEach((spectator) => {
				OutgoingMessageHandlers.notifyAboutGameShutdown(spectator.player)
				spectator.player.disconnectGameSocket()
			})
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.filter((playerInGame) => playerInGame.player.gameWebSocket && playerInGame.player.gameWebSocket.game === game)
			.forEach((playerInGame) => {
				OutgoingMessageHandlers.notifyAboutGameShutdown(playerInGame.player)
				playerInGame.player.disconnectGameSocket()
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

	private static MAXIMUM_GAME_WAITING = Time.minutes.toMilliseconds(5)
	private static MAXIMUM_GAME_DURATION = Time.minutes.toMilliseconds(60)
	private startGameTimeoutTimer(game: ServerGame): void {
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}
		setTimeout(() => {
			if (!game.isStarted) {
				OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameDestroyed(game)
				this.destroyGame(game, `Game not started within ${Time.milliseconds.toMinutes(GameLibrary.MAXIMUM_GAME_WAITING)} minutes.`)
			}
		}, GameLibrary.MAXIMUM_GAME_WAITING)
		setTimeout(() => {
			OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameDestroyed(game)
			this.destroyGame(game, `Game duration exceeded ${Time.milliseconds.toMinutes(GameLibrary.MAXIMUM_GAME_DURATION)} minutes.`)
		}, GameLibrary.MAXIMUM_GAME_DURATION)
	}

	private static GAME_CLEANUP_DELAY = Time.minutes.toMilliseconds(5)
	public startGameCleanupTimer(game: ServerGame): void {
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}
		OutgoingGlobalMessageHandlers.notifyAllPlayersAboutGameDestroyed(game)
		setTimeout(() => {
			this.destroyGame(game, 'Cleanup (Timeout)')
		}, GameLibrary.GAME_CLEANUP_DELAY)
	}
}

export default new GameLibrary()
