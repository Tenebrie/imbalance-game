import express, { Response } from 'express'
import RequireAdminAccessLevelMiddleware from '../middleware/RequireAdminAccessLevelMiddleware'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import RequireSupportAccessLevelMiddleware from '../middleware/RequireSupportAccessLevelMiddleware'
import RequireOriginalPlayerTokenMiddleware from '../middleware/RequireOriginalPlayerTokenMiddleware'
import TokenManager from '../services/TokenService'
import { getPlayerFromAuthenticatedRequest, setCookie } from '../utils/Utils'
import AccessLevel from '@shared/enums/AccessLevel'
import PlayerDatabase from '../database/PlayerDatabase'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'

const router = express.Router()

router.use(RequireOriginalPlayerTokenMiddleware)
router.use(RequireSupportAccessLevelMiddleware)

router.get(
	'/games',
	AsyncHandler(async (req, res: Response) => {
		const gameEntries = await GameHistoryDatabase.selectAllGames()
		res.json(gameEntries)
	})
)

router.get(
	'/players',
	AsyncHandler(async (req, res: Response) => {
		const playerEntries = await PlayerDatabase.selectAllPlayers()
		res.json(playerEntries)
	})
)

router.use(RequireAdminAccessLevelMiddleware)

router.post(
	'/players/:playerId/login',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer = getPlayerFromAuthenticatedRequest(req)
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		if (currentPlayer.id === targetPlayerId) {
			throw { status: 403, error: 'Unable to impersonate self' }
		}

		const player = await PlayerLibrary.loginById(targetPlayerId)
		if (!player) {
			throw { status: 400, error: 'Player id invalid' }
		}

		if (player.accessLevel === AccessLevel.DISABLED) {
			throw { status: 400, error: 'Target player is disabled' }
		}

		const playerToken = TokenManager.generateJwtToken(player)
		const originalPlayerToken = TokenManager.generateJwtToken(currentPlayer)
		setCookie(res, 'playerToken', playerToken)
		setCookie(res, 'originalPlayerToken', originalPlayerToken)

		res.status(204)
		res.send()
	})
)

router.get(
	'/games/:gameId',
	AsyncHandler(async (req, res: Response) => {
		const targetGameId = req.params['gameId']
		if (!targetGameId) {
			throw { status: 400, error: 'Missing gameId' }
		}

		const response = await GameHistoryDatabase.selectGameById(targetGameId)
		if (response === null) {
			throw { status: 500, error: 'Unable to select game entry from database' }
		}

		res.json(response)
	})
)

router.get(
	'/players/:playerId',
	AsyncHandler(async (req, res: Response) => {
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		const response = await PlayerDatabase.selectPlayerById(targetPlayerId)
		if (response === null) {
			throw { status: 500, error: 'Unable to select player from database' }
		}

		res.json(response)
	})
)

router.delete(
	'/players/:playerId',
	AsyncHandler(async (req, res: Response) => {
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		await PlayerDatabase.deletePlayer(targetPlayerId)
		res.status(204)
		res.send()
	})
)

router.post(
	'/players/:playerId/accessLevel',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer = getPlayerFromAuthenticatedRequest(req)
		const targetPlayerId = req.params['playerId']
		const accessLevel = req.body['accessLevel'] as AccessLevel
		if (!targetPlayerId || !accessLevel) {
			throw { status: 400, error: 'Missing playerId or accessLevel' }
		}

		if (currentPlayer.id === targetPlayerId) {
			throw { status: 403, error: 'Unable to edit self' }
		}

		await PlayerLibrary.updateAccessLevel(targetPlayerId, accessLevel)

		res.status(204)
		res.send()
	})
)

module.exports = router
