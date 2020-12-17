import express, {Response} from 'express'
import AsyncHandler from '../utils/AsyncHandler'
import TokenManager from '../services/TokenService'
import PlayerLibrary from '../game/players/PlayerLibrary'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'
import {clearCookie, setCookie} from '../utils/Utils'

const router = express.Router()

router.post('/', AsyncHandler(async (req, res: Response, next) => {
	const email = req.body['email']
	const password = req.body['password']
	if (!email || !password) {
		throw { status: 400, code: UserLoginErrorCode.MISSING_CREDENTIALS, error: 'Missing username or password' }
	}

	const player = await PlayerLibrary.login(email, password)
	if (!player) {
		throw { status: 400, code: UserLoginErrorCode.INVALID_CREDENTIALS, error: 'Username or password invalid' }
	}

	const playerToken = TokenManager.generateJwtToken(player)
	setCookie(res, 'playerToken', playerToken)
	res.json({ data: new OpenPlayerMessage(player) })
}))

router.delete('/', AsyncHandler(async (req, res: Response) => {
	// TODO: Disconnect the player and close the socket, if open
	const originalToken = req.cookies['originalPlayerToken']
	if (originalToken) {
		setCookie(res, 'playerToken', originalToken)
		clearCookie(res, 'originalPlayerToken', '')
	} else {
		clearCookie(res, 'playerToken', '')
	}

	res.json({
		success: true,
		stillAuthenticated: !!originalToken
	})
}))

module.exports = router
