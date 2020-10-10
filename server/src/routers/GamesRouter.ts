import express, {Request, Response} from 'express'
import ServerPlayer from '../game/players/ServerPlayer'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerGame from '../game/models/ServerGame'
import ServerBotPlayer from '../game/AI/ServerBotPlayer'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import GameLibrary from '../game/libraries/GameLibrary'
import GameMessage from '@shared/models/network/GameMessage'
import {getPlayerFromAuthenticatedRequest} from '../utils/Utils'
const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const library: ServerGame[] = GameLibrary.games
	const gameMessages = library.map(game => new GameMessage(game))
	res.json({ data: gameMessages })
})

router.post('/', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	const gameName = req.body['name'] || ''
	const gameMode = req.body['mode'] || ''

	const game = GameLibrary.createOwnedGame(player, gameName.trim())

	if (gameMode === 'sp_ai') {
		game.addPlayer(new ServerBotPlayer(), ServerTemplateCardDeck.botDeck(game))
	}

	res.json({ data: new GameMessage(game) })
})

router.delete('/:gameId', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	GameLibrary.destroyOwnedGame(req.params.gameId, player, 'Owner command')

	res.json({ success: true })
})

module.exports = router
