import express, { Response } from 'express'
import ServerPlayer from '../game/players/ServerPlayer'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerGame from '../game/models/ServerGame'
import ServerBotPlayer from '../game/AI/ServerBotPlayer'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import GameLibrary from '../game/libraries/GameLibrary'
import GameMessage from '@shared/models/network/GameMessage'
const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res: Response, next) => {
	const library: ServerGame[] = GameLibrary.games
	const gameMessages = library.map(game => new GameMessage(game))
	res.json({ data: gameMessages })
})

router.post('/', (req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const gameName = req.body['name'] || ''
	const gameMode = req.body['mode'] || ''

	const game = GameLibrary.createOwnedGame(player, gameName.trim())

	if (gameMode === 'sp_ai') {
		game.addPlayer(new ServerBotPlayer(), ServerTemplateCardDeck.botDeck(game))
	}

	res.json({ data: new GameMessage(game) })
})

router.delete('/:gameId', (req, res: Response, next) => {
	GameLibrary.destroyOwnedGame(req.params.gameId, req['player'], 'Owner command')

	res.json({ success: true })
})

module.exports = router
