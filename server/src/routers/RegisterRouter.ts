import AsyncHandler from '../utils/AsyncHandler'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'

import express, { Response } from 'express'
const router = express.Router()

router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const username = req.body['username']
	const password = req.body['password']

	if (!username || !password) { throw 'Missing username or password' }

	const playerLibrary = global.playerLibrary
	const player = await playerLibrary.getPlayerByUsername(username)
	if (player) { throw 'User already exists' }

	const success = await playerLibrary.register(username, password)
	res.json({ success: success })
}))

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
