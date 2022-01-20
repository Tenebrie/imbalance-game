import GameMessage from '@shared/models/network/GameMessage'
import GameCloseReason from '@src/enums/GameCloseReason'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import { RitesProgression } from '@src/game/models/ServerGameProgression'
import RulesetRitesIntro from '@src/game/rulesets/rites/RulesetRitesIntro'
import RulesetRitesRunCamp from '@src/game/rulesets/rites/service/RulesetRitesRunCamp'
import AsyncHandler from '@src/utils/AsyncHandler'
import express, { Request, Response } from 'express'

import GameLibrary from '../game/libraries/GameLibrary'
import ServerGame from '../game/models/ServerGame'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	const privateGame = req.query['private'] || ('' as string)
	const reconnect = req.query['reconnect'] || ('' as string)

	let filteredGames: ServerGame[] = GameLibrary.games.filter((game) => !game.isFinished)
	if (privateGame) {
		filteredGames = filteredGames.filter((game) => !!game.owner && game.owner.id === currentPlayer.id)
	} else if (!reconnect) {
		filteredGames = filteredGames.filter((game) => !game.owner)
	}

	if (reconnect) {
		filteredGames = filteredGames.filter((game) =>
			game.players.flatMap((playerGroup) => playerGroup.players).find((playerInGame) => playerInGame.player.id === currentPlayer.id)
		)
	} else {
		filteredGames = filteredGames.filter(
			(game) =>
				!game.players.flatMap((playerGroup) => playerGroup.players).find((playerInGame) => playerInGame.player.id === currentPlayer.id)
		)
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

	GameLibrary.destroyAllGamesForPlayer(player, GameVictoryCondition.PLAYER_STARTED_NEW_GAME)

	let ruleset: ServerRuleset
	try {
		ruleset = RulesetLibrary.findTemplateByClass(rulesetClass)
	} catch (err) {
		throw { status: 400, error: 'Invalid ruleset class' }
	}
	const game = GameLibrary.createGame(player, ruleset.constructor as RulesetConstructor)

	res.json({ data: new GameMessage(game) })
})

router.post(
	'/rites/solo',
	AsyncHandler(async (req, res) => {
		const player = getPlayerFromAuthenticatedRequest(req)

		GameLibrary.destroyAllGamesForPlayer(player, GameVictoryCondition.PLAYER_STARTED_NEW_GAME)

		const progression = await RitesProgression.forPlayer(player)

		const runStarted = progression.run.encounterHistory.length > 0
		const ruleset = runStarted ? RulesetRitesRunCamp : RulesetRitesIntro

		const game = GameLibrary.createGame(player, ruleset.constructor as RulesetConstructor)

		res.json({ data: new GameMessage(game) })
	})
)

router.post('/disconnect', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	currentPlayer.disconnectGameSocket()

	res.status(204)
	res.send()
})

router.delete('/:gameId', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	GameLibrary.destroyOwnedGame(req.params.gameId, player, GameCloseReason.OWNER_REQUEST)

	res.json({ success: true })
})

module.exports = router
