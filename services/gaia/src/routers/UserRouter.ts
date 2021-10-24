import UserLoginErrorCode from '@shared/enums/UserLoginErrorCode'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'
import EditorDeckDatabase from '@src/database/EditorDeckDatabase'
import StartingDecks from '@src/game/utils/StartingDecks'
import express, { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { OAuth2Client } from 'google-auth-library'

import PlayerDatabase from '../database/PlayerDatabase'
import PlayerLibrary from '../game/players/PlayerLibrary'
import ServerPlayer from '../game/players/ServerPlayer'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import TokenManager from '../services/TokenService'
import AsyncHandler from '../utils/AsyncHandler'
import { createHumanPlayerId, registerFormValidators, setCookie } from '../utils/Utils'

const router = express.Router()

router.post(
	'/',
	rateLimit({
		windowMs: 60 * 1000,
		max: 3,
	})
)

/* Registration endpoint. Does not require user token */
router.post(
	'/',
	AsyncHandler(async (req, res: Response) => {
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

		// Insert the user
		const success = await PlayerLibrary.register(email, username, password)
		if (!success) {
			throw { status: 500, error: 'General database error' }
		}

		// Insert the starting deck
		const registeredPlayer = await PlayerDatabase.selectPlayerByEmail(email)
		if (registeredPlayer) {
			await Promise.all(
				StartingDecks.getStartingDecks().map((startingDeck) => {
					return EditorDeckDatabase.insertEditorDeck(registeredPlayer, startingDeck)
				})
			)
		}

		res.status(204)
		res.send()
	})
)

router.post(
	'/google',
	rateLimit({
		windowMs: 60 * 1000,
		max: 3,
	})
)

/* Google SSO endpoint. Does not require user token */
router.post(
	'/google',
	AsyncHandler(async (req: Request, res: Response) => {
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
		if (!(await PlayerLibrary.doesPlayerExist(email))) {
			const username = payload.given_name!.toLowerCase() + '.' + payload.family_name!.toLowerCase()
			const success = await PlayerLibrary.register(email, username, createHumanPlayerId())
			if (!success) {
				throw { status: 500, error: 'General database error' }
			}
		}

		const player = await PlayerLibrary.loginWithoutPassword(email)
		if (!player) {
			throw { status: 404, error: 'User does not exist' }
		}

		const playerToken = TokenManager.generateJwtToken(player)
		setCookie(res, 'playerToken', playerToken)
		res.json({ data: new OpenPlayerMessage(player) })
	})
)

router.use(RequirePlayerTokenMiddleware)

router.get(
	'/',
	AsyncHandler(async (req, res: Response) => {
		const player = req['player'] as ServerPlayer
		const playerInDatabase = await PlayerDatabase.selectPlayerById(player.id)
		if (!playerInDatabase) {
			PlayerLibrary.removeFromCache(player)
			throw { status: 401, error: 'User does not exist' }
		}
		res.json({ data: new OpenPlayerMessage(player) })
	})
)

router.delete(
	'/',
	AsyncHandler(async (req, res: Response) => {
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
	})
)

module.exports = router
