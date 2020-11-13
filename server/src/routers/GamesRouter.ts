import express, {Request, Response} from 'express'
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
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	const reconnect = req.query['reconnect'] || '' as string

	let filteredGames: ServerGame[] = GameLibrary.games.filter(game => !game.isFinished)
	if (reconnect) {
		filteredGames = filteredGames.filter(game => game.players.find(playerInGame => playerInGame.player.id === currentPlayer.id))
	}

	const gameMessages = filteredGames.map(game => new GameMessage(game))
	res.json({ data: gameMessages })
})

router.post('/', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	const gameName = req.body['name'] || ''
	const gameMode = req.body['mode'] || ''

	const connectedGames = GameLibrary.games.filter(game => game.players.find(playerInGame => playerInGame.player === player))
	connectedGames.forEach(game => {
		const playerInGame = game.players.find(playerInGame => playerInGame.player === player)
		game.finish(playerInGame?.opponent || null, 'Opponent created a new game')
	})

	const game = GameLibrary.createOwnedGame(player, gameName.trim())

	if (gameMode === 'sp_ai') {
		game.addPlayer(new ServerBotPlayer(), ServerTemplateCardDeck.botDeck(game))
	}

	res.json({ data: new GameMessage(game) })
})

router.post('/disconnect', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	currentPlayer.disconnect()

	res.status(204)
	res.send()
})

router.delete('/:gameId', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	GameLibrary.destroyOwnedGame(req.params.gameId, player, 'Owner command')

	res.json({ success: true })
})

module.exports = router
