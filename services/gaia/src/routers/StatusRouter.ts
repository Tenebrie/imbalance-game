import { OutgoingGlobalMessageHandlers } from '@src/game/handlers/OutgoingGlobalMessageHandlers'
import GameLibrary from '@src/game/libraries/GameLibrary'
import PlayerLibrary from '@src/game/players/PlayerLibrary'
import ServerPlayer from '@src/game/players/ServerPlayer'
import RequirePlayerTokenMiddleware from '@src/middleware/RequirePlayerTokenMiddleware'
import { colorizePlayer, createRandomGuid } from '@src/utils/Utils'
import express from 'express'
import { Router as WebSocketRouter } from 'express-ws'
import * as ws from 'ws'

const router = express.Router() as WebSocketRouter

router.use(RequirePlayerTokenMiddleware)

router.ws('/', async (ws: ws, req: express.Request) => {
	const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentPlayer) {
		ws.close()
		return
	}
	const connectionId = createRandomGuid()
	currentPlayer.registerGlobalConnection(ws, connectionId)
	console.info(`Player ${colorizePlayer(currentPlayer.username)} connected!`)

	OutgoingGlobalMessageHandlers.notifyPlayerEstablishedConnection(currentPlayer)

	const games = GameLibrary.games.filter((game) => game.isVisibleInList(currentPlayer))
	OutgoingGlobalMessageHandlers.notifyPlayerAboutExistingGames(currentPlayer, games)

	ws.on('close', () => {
		currentPlayer.disconnectGlobalSocket(connectionId)
		console.info(`Player ${colorizePlayer(currentPlayer.username)} disconnected!`)
	})
})

module.exports = router
