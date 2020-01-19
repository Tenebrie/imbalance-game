import express, { Response } from 'express'
const router = express.Router()

import PlayerMessage from '../game/shared/models/network/PlayerMessage'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res: Response, next) => {
	const player = req['player']
	res.json({ data: PlayerMessage.fromPlayer(player) })
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
