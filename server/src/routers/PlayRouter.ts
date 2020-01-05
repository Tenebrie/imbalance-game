import express from 'express'
import ServerGame from '../libraries/game/ServerGame'
import ServerPlayer from '../libraries/players/ServerPlayer'
import ServerDeck from '../models/game/ServerDeck'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

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

	currentGame.addPlayer(currentPlayer, ServerDeck.defaultDeck())
	currentPlayer.registerConnection(ws)

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(rawMsg)
		const handler = IncomingMessageHandlers[msg.type]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws)
			return
		}

		const response = handler(msg.data, currentGame, currentPlayer)
		if (response) {
			ws.send(JSON.stringify(response))
		}
	})

	ws.on('close', () => {
		currentGame.removePlayer(currentPlayer)
	})
})

router.use((err, req, res, next) => {
	console.error(err)
})

module.exports = router
