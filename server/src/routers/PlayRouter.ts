import * as ws from 'ws'
import * as express from 'express'
import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import IncomingMessageHandlers from '../game/handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '../game/handlers/OutgoingMessageHandlers'
import ConnectionEstablishedHandler from '../game/handlers/ConnectionEstablishedHandler'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import EditorDeckDatabase from '../database/EditorDeckDatabase'
import PlayerLibrary from '../game/players/PlayerLibrary'
import GameLibrary from '../game/libraries/GameLibrary'
import {colorizeId} from '../utils/Utils'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import IncomingSpectatorMessageHandlers from '../game/handlers/IncomingSpectatorMessageHandlers'
import {ClientToServerMessageTypes, ClientToServerSpectatorMessageTypes} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import {Router as WebSocketRouter} from 'express-ws'

const router = express.Router() as WebSocketRouter

// @ts-ignore
router.ws('/:gameId', async (ws: ws, req: express.Request) => {
	const currentGame: ServerGame | null = GameLibrary.games.find(game => game.id === req.params.gameId) || null
	const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	let currentPlayerInGame: ServerPlayerInGame
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	const connectedPlayer = currentGame.players.find(playerInGame => playerInGame.player === currentPlayer)
	if (currentGame.isStarted && (!connectedPlayer || (connectedPlayer && connectedPlayer.player.isInGame()))) {
		OutgoingMessageHandlers.notifyAboutGameAlreadyStarted(ws)
		ws.close()
		return
	}

	// Reconnecting
	if (connectedPlayer) {
		currentPlayerInGame = currentGame.players.find(playerInGame => playerInGame.player === currentPlayer)!
	}

	// Fresh connection
	if (!connectedPlayer) {
		const deckId = req.query.deckId as string
		if (!deckId) {
			OutgoingMessageHandlers.notifyAboutMissingDeckId(ws)
			ws.close()
			return
		}

		const deck = await EditorDeckDatabase.selectEditorDeckByIdForPlayer(deckId, currentPlayer)
		if (!deck) {
			OutgoingMessageHandlers.notifyAboutInvalidDeck(ws)
			ws.close()
			return
		}

		currentPlayerInGame = currentGame.addPlayer(currentPlayer, ServerTemplateCardDeck.fromEditorDeck(currentGame, deck))
	}

	currentPlayer.disconnect()
	currentPlayer.registerConnection(ws)

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(rawMsg)
		const messageType = msg.type as ClientToServerMessageTypes
		const handler = IncomingMessageHandlers[messageType]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws, msg.type)
			return
		}

		try {
			handler(msg.data, currentGame, currentPlayerInGame)
		} catch (e) {
			console.error(`An unexpected error occurred in game ${colorizeId(currentGame.id)}. It will be shut down.`, e)
			currentGame.forceShutdown('An error occurred')
		}
	})

	ws.on('close', () => {
		currentPlayerInGame.disconnect()
		ConnectionEstablishedHandler.onPlayerDisconnected(currentGame, currentPlayer)
	})

	OutgoingMessageHandlers.notifyAboutInitRequested(currentPlayer)
})

// @ts-ignore
router.ws('/:gameId/spectate/:playerId', async (ws: ws, req: express.Request) => {
	const gameId = req.params.gameId as string
	const playerId = req.params.playerId as string

	const currentGame: ServerGame | null = GameLibrary.games.find(game => game.id === gameId) || null
	const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	const spectatedPlayer: ServerPlayerInGame | undefined = currentGame.players.find(player => player.player.id === playerId)
	if (!spectatedPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	if (currentGame.spectators.find(spectator => spectator.player === currentPlayer)) {
		OutgoingMessageHandlers.notifyAboutDuplicatedConnection(ws)
		ws.close()
		return
	}

	currentPlayer.disconnect()
	currentPlayer.registerConnection(ws)

	const currentSpectator = spectatedPlayer.player.spectate(currentGame, currentPlayer)

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(rawMsg)
		const messageType = msg.type as ClientToServerSpectatorMessageTypes
		const handler = IncomingSpectatorMessageHandlers[messageType]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws, msg.type)
			return
		}

		try {
			handler(msg.data, currentGame, currentSpectator)
		} catch (e) {
			console.error(`An unexpected error occurred in game ${colorizeId(currentGame.id)}. It will be shut down.`, e)
			currentGame.forceShutdown('An error occurred')
		}
	})

	ws.on('close', () => {
		spectatedPlayer.player.removeSpectator(currentSpectator)
	})

	OutgoingMessageHandlers.notifyAboutInitRequested(currentSpectator.player)
})

module.exports = router
