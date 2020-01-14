import express from 'express'
import ServerGame from '../libraries/game/ServerGame'
import ServerCardDeck from '../models/game/ServerCardDeck'
import ServerPlayer from '../libraries/players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ConnectionEstablishedHandler from '../handlers/ConnectionEstablishedHandler'

const router = express.Router()

router.ws('/:gameId', async (ws, req) => {
	const currentGame: ServerGame = global.gameLibrary.games.find(game => game.id === req.params.gameId)
	const currentPlayer: ServerPlayer = await global.playerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	currentPlayer.disconnect()
	currentPlayer.registerConnection(ws)

	const currentPlayerInGame = currentGame.addPlayer(currentPlayer, ServerCardDeck.defaultDeck(currentGame))
	ConnectionEstablishedHandler.onPlayerConnected(currentGame, currentPlayerInGame)

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(rawMsg)
		const handler = IncomingMessageHandlers[msg.type]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws)
			return
		}

		handler(msg.data, currentGame, currentPlayerInGame)
	})

	ws.on('close', () => {
		currentGame.removePlayer(currentPlayer)
		ConnectionEstablishedHandler.onPlayerDisconnected(currentGame, currentPlayer)
	})
})

router.use((err, req, res, next) => {
	console.error(err)
})

module.exports = router
