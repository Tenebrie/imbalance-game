import express, { Response } from 'express'
const router = express.Router()

import AsyncHandler from '../utils/AsyncHandler'
import TokenManager from '../services/TokenService'
import PlayerMessage from '@shared/models/network/PlayerMessage'
import PlayerLibrary from '../game/players/PlayerLibrary'
import GenericErrorMiddleware from '../middleware/GenericErrorMiddleware'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'

router.post('/', AsyncHandler(async (req, res: Response, next) => {
	const username = req.body['username']
	const password = req.body['password']
	if (!username || !password) {
		throw { status: 400, code: UserLoginErrorCode.MISSING_CREDENTIALS, error: 'Missing username or password' }
	}

	const player = await PlayerLibrary.login(username, password)
	if (!player) {
		throw { status: 400, code: UserLoginErrorCode.INVALID_CREDENTIALS, error: 'Username or password invalid' }
	}

	console.log(player)

	const playerToken = TokenManager.generateJwtToken(player)
	res.cookie('playerToken', playerToken, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })
	res.json({ data: PlayerMessage.fromPlayer(player) })
}))

router.use(GenericErrorMiddleware)

module.exports = router
