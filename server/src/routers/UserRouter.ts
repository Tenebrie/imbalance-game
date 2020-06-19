import express, { Response } from 'express'
const router = express.Router()

import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import PlayerMessage from '@shared/models/network/PlayerMessage'
import AsyncHandler from '../utils/AsyncHandler'
import Database from '../database/Database'
import PlayerLibrary from '../game/players/PlayerLibrary'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import { tryUntil } from '../utils/Utils'
import PlayerDatabase from '../database/PlayerDatabase'

router.use(AsyncHandler(async (req, res, next) => {
	if (!Database.isReady()) {
		throw { status: 503, error: 'Database client is not yet ready' }
	}
	next()
}))

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
	if (!isUsernameAvailable) {
		throw { status: 409, code: UserRegisterErrorCode.USERNAME_COLLISIONS, error: 'Username collision after 10 attempts' }
	}

	const success = await PlayerLibrary.register(email, numberedUsername, password)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.send()
}))

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const playerInDatabase = await PlayerDatabase.selectPlayerById(player.id)
	if (!playerInDatabase) {
		PlayerLibrary.removeFromCache(player)
		throw { status: 401, error: 'User does not exist' }
	}
	res.json({ data: PlayerMessage.fromPlayer(player) })
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
