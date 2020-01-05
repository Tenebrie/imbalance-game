import express, { Response } from 'express'
const router = express.Router()

import AsyncHandler from '../utils/AsyncHandler'
import PlayerMessage from '../models/network/PlayerMessage'
import TokenManager from '../services/TokenService'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'

router.post('/', AsyncHandler(async (req, res: Response, next) => {
	const username = req.body['username']
	const password = req.body['password']
	if (!username || !password) { throw 'Missing username or password' }

	const player = await global.playerLibrary.login(username, password)
	if (!player) { throw 'Username or password invalid' }

	const playerToken = TokenManager.generateJwtToken(player)
	res.cookie('playerToken', playerToken, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })
	res.json({ data: PlayerMessage.fromPlayer(player) })
}))

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
