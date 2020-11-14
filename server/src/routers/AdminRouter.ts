import express, {Response} from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import RequireAdminAccessLevelMiddleware from '../middleware/RequireAdminAccessLevelMiddleware'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import OpenPlayerMessage from '@shared/models/network/player/OpenPlayerMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)
router.use(RequireAdminAccessLevelMiddleware)

router.get('/players', AsyncHandler(async(req, res: Response) => {
	const players = await PlayerLibrary.getAllPlayers()
	if (!players) {
		throw { status: 500 }
	}
	const playerMessages = players.map(player => new OpenPlayerMessage(player))
	res.json(playerMessages)
}))

module.exports = router
