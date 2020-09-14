import express, {Response} from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import PlayerMessage from '@shared/models/network/PlayerMessage'
import AsyncHandler from '../utils/AsyncHandler'
import {OAuth2Client} from 'google-auth-library'
import PlayerLibrary from '../game/players/PlayerLibrary'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import {tryUntil} from '../utils/Utils'
import PlayerDatabase from '../database/PlayerDatabase'
import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import TokenManager from '../services/TokenService'
import uuidv4 from 'uuid/v4'

const router = express.Router()

const createNumberedUsername = (username: string): string => {
	let existingPlayer
	let numberedUsername
	const isUsernameAvailable = tryUntil({
		try: async () => {
			const randomNumber = Math.floor(1000 + Math.random() * 9000)
			numberedUsername = `${username}#${randomNumber}`
			existingPlayer = await PlayerDatabase.selectPlayerByUsername(numberedUsername)
		},
		until: async () => {
			return !existingPlayer
		},
		maxAttempts: 10
	})
	if (!isUsernameAvailable || !numberedUsername) {
		throw { status: 409, code: UserRegisterErrorCode.USERNAME_COLLISIONS, error: 'Username collision after 10 attempts' }
	}
	return numberedUsername
}

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

	const success = await PlayerLibrary.register(email, createNumberedUsername(username), password)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.send()
}))

/* Google SSO endpoint. Does not require user token */
router.post('/google', AsyncHandler(async (req, res: Response, next) => {
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

	const email = payload.email
	if (!await PlayerLibrary.doesPlayerExist(email)) {
		const username = payload.given_name.toLowerCase() + '.' + payload.family_name.toLowerCase()
		const success = await PlayerLibrary.register(email, createNumberedUsername(username), uuidv4())
		if (!success) {
			throw { status: 500, error: 'General database error' }
		}
	}

	const player = await PlayerLibrary.loginWithoutPassword(email)
	const playerToken = TokenManager.generateJwtToken(player)
	res.cookie('playerToken', playerToken, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })
	res.json({ data: new PlayerMessage(player) })
}))

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const playerInDatabase = await PlayerDatabase.selectPlayerById(player.id)
	if (!playerInDatabase) {
		PlayerLibrary.removeFromCache(player)
		throw { status: 401, error: 'User does not exist' }
	}
	res.json({ data: new PlayerMessage(player) })
}))

router.delete('/', AsyncHandler(async(req, res: Response, next) => {
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
