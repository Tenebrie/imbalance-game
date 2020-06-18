import express, { Response } from 'express'
import AsyncHandler from '../utils/AsyncHandler'
import Database from '../database/Database'
import PlayerLibrary from '../game/players/PlayerLibrary'
import GenericErrorMiddleware from '../middleware/GenericErrorMiddleware'

const router = express.Router()

router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const username = req.body['username']
	const password = req.body['password']

	if (!username || !password) {
		throw { status: 400, error: 'Missing username or password' }
	}

	if (!Database.isReady()) {
		throw { status: 503, error: 'Database client is not yet ready' }
	}

	const player = await PlayerLibrary.getPlayerByUsername(username)
	if (player) {
		throw { status: 409, error: 'User already exists' }
	}

	const success = await PlayerLibrary.register(username, password)
	if (!success) {
		throw { status: 500, error: 'General database error' }
	}
	res.status(204)
	res.send()
}))

router.use(GenericErrorMiddleware)

module.exports = router
