import express, { Response } from 'express'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerGameMessage from '../game/models/messages/ServerGameMessage'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import ServerGame from '../game/models/ServerGame'
import ServerBotPlayer from '../game/utils/ServerBotPlayer'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res: Response, next) => {
	const library: ServerGame[] = global.gameLibrary.games
	const filteredLibrary = library.filter(game => !game.isStarted)
	const gameMessages = filteredLibrary.map(game => ServerGameMessage.fromServerGame(game))
	res.json({ data: gameMessages })
})

router.post('/', (req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const gameName = req.body['name'] || ''
	const gameMode = req.body['mode'] || ''

	const gameLibrary = global.gameLibrary

	const game = gameLibrary.createOwnedGame(player, gameName.trim())

	if (gameMode === 'sp_ai') {
		game.addPlayer(new ServerBotPlayer(), ServerTemplateCardDeck.botDeck(game))
	}

	res.json({ data: ServerGameMessage.fromServerGame(game) })
})

router.delete('/:gameId', (req, res: Response, next) => {
	const gameLibrary = global.gameLibrary
	gameLibrary.destroyOwnedGame(req.params.gameId, req['player'], 'Owner command')

	res.json({ success: true })
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
