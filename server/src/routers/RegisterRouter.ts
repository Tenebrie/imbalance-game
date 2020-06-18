import express, { Response } from 'express'
import AsyncHandler from '../utils/AsyncHandler'
import Database from '../database/Database'
import PlayerLibrary from '../game/players/PlayerLibrary'
import GenericErrorMiddleware from '../middleware/GenericErrorMiddleware'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'

const router = express.Router()

const MAXIMUM_NUMBER_ATTEMPTS = 10

interface TryUntilArgs {
	try: () => void | Promise<void>
	until: () => boolean | Promise<boolean>
	maxAttempts: number
}

const tryUntil = (args: TryUntilArgs): boolean => {
	for (let i = 0; i < MAXIMUM_NUMBER_ATTEMPTS; i++) {
		args.try()
		if (args.until) {
			return true
		}
	}
	return false
}

router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const email = req.body['email']
	const username = req.body['username']
	const password = req.body['password']

	if (!email || !username || !password) {
		throw { status: 400, error: 'Missing required fields' }
	}

	if (!Database.isReady()) {
		throw { status: 503, error: 'Database client is not yet ready' }
	}

	const player = await PlayerLibrary.getPlayerByEmail(email)
	if (player) {
		throw { status: 409, code: UserRegisterErrorCode.EMAIL_TAKEN, error: 'User already exists' }
	}

	let existingPlayer
	let numberedUsername
	const isUsernameAvailable = tryUntil({
		try: async () => {
			const randomNumber = Math.floor(1000 + Math.random() * 9000)
			numberedUsername = `${username}#${randomNumber}`
			existingPlayer = await PlayerLibrary.getPlayerByUsername(numberedUsername)
		},
		until: async () => {
			return !existingPlayer
		},
		maxAttempts: MAXIMUM_NUMBER_ATTEMPTS
	})
	if (!isUsernameAvailable) {
		throw { status: 409, code: UserRegisterErrorCode.USERNAME_COLLISIONS, error: `Username collision after ${MAXIMUM_NUMBER_ATTEMPTS} attempts` }
	}

	const success = await PlayerLibrary.register(email, numberedUsername, password)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.send()
}))

router.use(GenericErrorMiddleware)

module.exports = router
