import express, { Request, Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerGame from '../game/models/ServerGame'
import ServerBotPlayer from '../game/AI/ServerBotPlayer'
import GameLibrary from '../game/libraries/GameLibrary'
import GameMessage from '@shared/models/network/GameMessage'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import { ServerRulesetTemplate } from '@src/game/models/rulesets/ServerRuleset'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	const privateGame = req.query['private'] || ('' as string)
	const reconnect = req.query['reconnect'] || ('' as string)

	let filteredGames: ServerGame[] = GameLibrary.games.filter((game) => !game.isFinished)
	if (privateGame) {
		filteredGames = filteredGames.filter((game) => !!game.owner && game.owner.id === currentPlayer.id)
	}
	if (reconnect) {
		filteredGames = filteredGames.filter((game) => game.players.find((playerInGame) => playerInGame.player.id === currentPlayer.id))
	} else {
		filteredGames = filteredGames.filter((game) => !game.players.find((playerInGame) => playerInGame.player.id === currentPlayer.id))
	}

	const gameMessages = filteredGames.map((game) => new GameMessage(game))
	res.json({ data: gameMessages })
})

router.post('/', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	const rulesetClass = req.body['ruleset'] as string

	if (!rulesetClass) {
		throw { status: 400, error: '"ruleset" param not provided' }
	}

	const connectedGames = GameLibrary.games.filter((game) => game.players.find((playerInGame) => playerInGame.player === player))
	connectedGames.forEach((game) => {
		const playerInGame = game.players.find((playerInGame) => playerInGame.player === player)
		game.finish(playerInGame?.opponent || null, 'Player surrendered (Started new game)')
	})

	let ruleset: ServerRulesetTemplate
	try {
		ruleset = RulesetLibrary.findTemplateByClass(rulesetClass)
	} catch (err) {
		throw { status: 400, error: 'Invalid ruleset class' }
	}
	const game = GameLibrary.createPublicGame(player, ruleset, {})

	if (ruleset.ai) {
		game.addPlayer(new ServerBotPlayer(), ruleset.ai.deck)
	}

	res.json({ data: new GameMessage(game) })
})

router.post('/disconnect', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	currentPlayer.disconnect()

	res.status(204)
	res.send()
})

router.delete('/:gameId', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	GameLibrary.destroyOwnedGame(req.params.gameId, player, 'Owner command')

	res.json({ success: true })
})

module.exports = router
