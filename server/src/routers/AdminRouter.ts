import express, { Response } from 'express'
import RequireAdminAccessLevelMiddleware from '../middleware/RequireAdminAccessLevelMiddleware'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'
import RequireSupportAccessLevelMiddleware from '../middleware/RequireSupportAccessLevelMiddleware'
import RequireOriginalPlayerTokenMiddleware from '../middleware/RequireOriginalPlayerTokenMiddleware'
import TokenManager from '../services/TokenService'
import { getPlayerFromAuthenticatedRequest, setCookie } from '../utils/Utils'
import AccessLevel from '@shared/enums/AccessLevel'

const router = express.Router()

router.use(RequireOriginalPlayerTokenMiddleware)
router.use(RequireSupportAccessLevelMiddleware)

router.get(
	'/players',
	AsyncHandler(async (req, res: Response) => {
		const players = await PlayerLibrary.getAllPlayers()
		const playerMessages = players?.map((player) => new OpenPlayerMessage(player)) || []
		res.json(playerMessages)
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
