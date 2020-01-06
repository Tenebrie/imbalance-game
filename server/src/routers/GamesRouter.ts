import express, { Response } from 'express'
const router = express.Router()

import ServerPlayer from '../libraries/players/ServerPlayer'
import ServerGameMessage from '../models/messages/ServerGameMessage'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res: Response, next) => {
	const library = global.gameLibrary

	const gameMessages = library.games.map(game => ServerGameMessage.fromServerGame(game))
	res.json({ data: gameMessages })
})

router.post('/', (req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const gameName = req.body['name'] || ''
	const gameLibrary = global.gameLibrary

	const game = gameLibrary.createOwnedGame(player, gameName.trim())

	res.json({ data: ServerGameMessage.fromServerGame(game) })
})

router.delete('/:gameId', (req, res: Response, next) => {
	const gameLibrary = global.gameLibrary
	gameLibrary.destroyOwnedGame(req.params.gameId, req['player'])

	res.json({ success: true })
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
