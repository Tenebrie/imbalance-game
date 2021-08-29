import RequirePlayerTokenMiddleware from '@src/middleware/RequirePlayerTokenMiddleware'
import express, { Request, Response } from 'express'

import PlayerDatabase from '../database/PlayerDatabase'
import AsyncHandler from '../utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.post(
	'/welcome',
	AsyncHandler(async (req: Request, res: Response) => {
		const player = getPlayerFromAuthenticatedRequest(req)
		await PlayerDatabase.updatePlayerWelcomeModalSeenAt(player.id)

		res.status(204)
		res.send()
	})
)

router.post(
	'/mobile',
	AsyncHandler(async (req: Request, res: Response) => {
		const player = getPlayerFromAuthenticatedRequest(req)
		await PlayerDatabase.updatePlayerMobileModalSeenAt(player.id)

		res.status(204)
		res.send()
	})
)

module.exports = router
