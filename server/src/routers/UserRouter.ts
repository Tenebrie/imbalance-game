import express, {Request, Response} from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import AsyncHandler from '../utils/AsyncHandler'
import {OAuth2Client} from 'google-auth-library'
import PlayerLibrary from '../game/players/PlayerLibrary'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import PlayerDatabase from '../database/PlayerDatabase'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import TokenManager from '../services/TokenService'
import { v4 as uuidv4 } from 'uuid'
import {registerFormValidators} from '../utils/Utils'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'

const router = express.Router()

/* Registration endpoint. Does not require user token */
router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const email = req.body['email']
	const username = req.body['username']
	const password = req.body['password']

	if (!email || !username || !password) {
		throw { status: 400, error: 'Missing required fields' }
	}

	const player = await PlayerDatabase.selectPlayerByEmail(email)
	if (player) {
		throw { status: 409, code: UserRegisterErrorCode.EMAIL_TAKEN, error: 'User already exists' }
	}

	if (!registerFormValidators.email(email)) {
		throw { status: 400, error: 'Email value invalid' }
	}
	if (!registerFormValidators.username(username)) {
		throw { status: 400, error: 'Username value invalid' }
	}
	if (!registerFormValidators.password(password)) {
		throw { status: 400, error: 'Password value invalid' }
	}

	const success = await PlayerLibrary.register(email, username, password)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.send()
}))

/* Google SSO endpoint. Does not require user token */
router.post('/google', AsyncHandler(async (req: Request, res: Response) => {
	const token = req.body['token']
	if (!token) {
		throw { status: 400, code: UserLoginErrorCode.MISSING_CREDENTIALS, error: 'Missing token' }
	}

	const googleClientId = '420130185393-43gcs9r2017ftkpi3t7tes3dktur8qgh.apps.googleusercontent.com'
	const client = new OAuth2Client(googleClientId)
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: googleClientId,
	})
	const payload = ticket.getPayload()
	if (!payload) {
		throw { status: 400, error: 'Bad token' }
	}

	const email = payload.email!
	if (!await PlayerLibrary.doesPlayerExist(email)) {
		const username = payload.given_name!.toLowerCase() + '.' + payload.family_name!.toLowerCase()
		const success = await PlayerLibrary.register(email, username, uuidv4())
		if (!success) {
			throw { status: 500, error: 'General database error' }
		}
	}

	const player = await PlayerLibrary.loginWithoutPassword(email)
	if (!player) {
		throw { status: 404, error: 'User does not exist' }
	}

	const playerToken = TokenManager.generateJwtToken(player)
	res.cookie('playerToken', playerToken, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })
	res.json({ data: new OpenPlayerMessage(player) })
}))

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response) => {
	const player = req['player'] as ServerPlayer
	const playerInDatabase = await PlayerDatabase.selectPlayerById(player.id)
	if (!playerInDatabase) {
		PlayerLibrary.removeFromCache(player)
		throw { status: 401, error: 'User does not exist' }
	}
	res.json({ data: new OpenPlayerMessage(player) })
}))

router.delete('/', AsyncHandler(async(req, res: Response) => {
	const player = req['player'] as ServerPlayer

	const playerInDatabase = await PlayerDatabase.selectPlayerById(player.id)
	if (!playerInDatabase) {
		PlayerLibrary.removeFromCache(player)
		res.cookie('playerToken', '', { maxAge: Date.now(), httpOnly: true })
		throw { status: 204 }
	}

	const success = await PlayerLibrary.deletePlayer(player)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.cookie('playerToken', '', { maxAge: Date.now(), httpOnly: true })
	res.send()
}))

module.exports = router
