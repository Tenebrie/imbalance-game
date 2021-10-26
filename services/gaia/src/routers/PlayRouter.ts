import CustomDeckRules from '@shared/enums/CustomDeckRules'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import {
	ClientToServerGameMessage,
	ClientToServerMessageTypeMappers,
	ClientToServerSpectatorMessageTypes,
} from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import PlayerInGame from '@shared/models/PlayerInGame'
import { enumToArray } from '@shared/Utils'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import DiscordIntegration from '@src/game/integrations/DiscordIntegration'
import EventContext from '@src/game/models/EventContext'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import { genericError } from '@src/middleware/GenericErrorMiddleware'
import RequirePlayerTokenMiddleware from '@src/middleware/RequirePlayerTokenMiddleware'
import AsyncHandler from '@src/utils/AsyncHandler'
import * as express from 'express'
import { Response } from 'express'
import { Router as WebSocketRouter } from 'express-ws'
import * as ws from 'ws'

import EditorDeckDatabase from '../database/EditorDeckDatabase'
import ConnectionEstablishedHandler from '../game/handlers/ConnectionEstablishedHandler'
import IncomingMessageHandlers from '../game/handlers/IncomingMessageHandlers'
import IncomingSpectatorMessageHandlers from '../game/handlers/IncomingSpectatorMessageHandlers'
import OutgoingMessageHandlers from '../game/handlers/OutgoingMessageHandlers'
import GameLibrary from '../game/libraries/GameLibrary'
import ServerGame from '../game/models/ServerGame'
import PlayerLibrary from '../game/players/PlayerLibrary'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import { colorizeId, restoreObjectIDs, shuffle } from '../utils/Utils'

const router = express.Router() as WebSocketRouter

router.use(RequirePlayerTokenMiddleware)

router.ws('/:gameId', async (ws: ws, req: express.Request) => {
	const currentGame: ServerGame | null = GameLibrary.games.find((game) => game.id === req.params.gameId) || null
	const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	const connectedPlayer: ServerPlayerInGame | undefined = currentGame.players
		.flatMap((playerGroup) => playerGroup.players)
		.find((playerInGame) => playerInGame.player.id === currentPlayer.id)
	if (currentGame.isStarted && !connectedPlayer) {
		OutgoingMessageHandlers.notifyAboutGameAlreadyStarted(ws)
		ws.close()
		return
	}

	// Reconnecting
	let currentPlayerInGame: ServerPlayerInGame
	if (connectedPlayer) {
		const reconnectingPlayer = currentGame.players
			.flatMap((playerGroup) => playerGroup.players)
			.find((playerInGame) => playerInGame.player.id === currentPlayer.id)
		if (!reconnectingPlayer) {
			throw new Error('Unable to find reconnecting player in game.')
		}
		currentPlayerInGame = reconnectingPlayer
		currentPlayer.spectators = currentPlayerInGame.player.spectators
		currentPlayerInGame.player = currentPlayer
	}

	// Fresh connection
	if (!connectedPlayer) {
		const deckId = req.query.deckId as string
		const groupId = req.query.groupId as string

		if (!groupId) {
			OutgoingMessageHandlers.notifyAboutMissingGroupId(ws)
			ws.close()
			return
		}

		const targetGroup = currentGame.players.find((group) => group.id === groupId)
		if (!targetGroup) {
			OutgoingMessageHandlers.notifyAboutInvalidGroupId(ws)
			ws.close()
			return
		}

		const targetSlot = targetGroup.slots.grabOpenHumanSlot()
		const deckRulesValues = enumToArray(CustomDeckRules)
		const deckRequired = !Array.isArray(targetSlot.deck) && deckRulesValues.includes(targetSlot.deck)
		if (!deckId && deckRequired) {
			OutgoingMessageHandlers.notifyAboutMissingDeckId(ws)
			ws.close()
			return
		}

		let templateDeck
		if (deckRequired) {
			const deck = await EditorDeckDatabase.selectEditorDeckByIdForPlayer(deckId, currentPlayer)
			if (!deck) {
				OutgoingMessageHandlers.notifyAboutInvalidDeck(ws)
				ws.close()
				return
			}
			templateDeck = deck
		} else if (Array.isArray(targetSlot.deck)) {
			templateDeck = ServerEditorDeck.fromConstructors(targetSlot.deck)
		} else {
			throw new Error("Unknown error while trying to find player's deck.")
		}

		currentPlayerInGame = currentGame.addHumanPlayer(currentPlayer, targetGroup, templateDeck)
	}

	currentPlayer.disconnectGameSocket()
	currentPlayer.registerGameConnection(ws, currentGame)

	ws.on('message', (rawMsg: string) => {
		EventContext.setGame(currentGame)
		const msg = JSON.parse(restoreObjectIDs(currentGame, rawMsg)) as ClientToServerGameMessage
		const messageType = msg.type
		const handler = IncomingMessageHandlers[messageType] as (
			data: ClientToServerMessageTypeMappers[typeof messageType],
			game: ServerGame,
			playerInGame: PlayerInGame
		) => void
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws, msg.type)
			return
		}

		try {
			OutgoingMessageHandlers.notifyAboutMessageAcknowledged(currentPlayerInGame.player)
			const t1 = process.hrtime()
			handler(msg.data, currentGame, currentPlayerInGame)
			const t2 = process.hrtime(t1)
			OutgoingMessageHandlers.notifyAboutPerformanceMetrics(currentPlayerInGame.player, t2[1] / 1000000)
			OutgoingMessageHandlers.executeMessageQueue(currentGame)
		} catch (error) {
			console.error(`An unexpected error occurred in game ${colorizeId(currentGame.id)}. It will be shut down.`, error)
			GameHistoryDatabase.logGameError(currentGame, error as Error)
			DiscordIntegration.sendFatalError(currentGame, error as Error)
			currentGame.players
				.flatMap((playerGroup) => playerGroup.players)
				.forEach((playerInGame) => {
					OutgoingMessageHandlers.notifyAboutGameCollapsed(playerInGame.player, currentGame)
				})
			GameHistoryDatabase.closeGame(currentGame, 'Unhandled error (Player action)', null)
			GameLibrary.destroyGame(currentGame, 'Unhandled error (Player action)')
		}
		EventContext.clear()
	})

	ws.on('close', () => {
		currentPlayerInGame.disconnect()
		ConnectionEstablishedHandler.onPlayerDisconnected(currentGame, currentPlayer)
	})

	OutgoingMessageHandlers.notifyAboutInitRequested(currentPlayer)
	OutgoingMessageHandlers.broadcastPlayersInLobby(currentGame)
})

router.ws('/:gameId/spectate/:playerId', async (ws: ws, req: express.Request) => {
	const gameId = req.params.gameId as string
	const playerId = req.params.playerId as string

	const currentGame: ServerGame | null = GameLibrary.games.find((game) => game.id === gameId) || null
	const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	const spectatedPlayer: ServerPlayerInGame | undefined = currentGame.players
		.flatMap((playerGroup) => playerGroup.players)
		.find((player) => player.player.id === playerId)
	if (!spectatedPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	if (currentGame.spectators.find((spectator) => spectator.player === currentPlayer)) {
		OutgoingMessageHandlers.notifyAboutDuplicatedConnection(ws)
		ws.close()
		return
	}

	currentPlayer.disconnectGameSocket()
	currentPlayer.registerGameConnection(ws, currentGame)

	const currentSpectator = spectatedPlayer.player.spectate(currentGame, currentPlayer)

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(restoreObjectIDs(currentGame, rawMsg))
		const messageType = msg.type as ClientToServerSpectatorMessageTypes
		const handler = IncomingSpectatorMessageHandlers[messageType]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws, msg.type)
			return
		}

		try {
			handler(msg.data, currentGame, currentSpectator)
		} catch (error) {
			console.error(`An unexpected error occurred in game ${colorizeId(currentGame.id)}. It will be shut down.`, error)
			GameHistoryDatabase.logGameError(currentGame, error as Error)
			DiscordIntegration.sendFatalError(currentGame, error as Error)
			currentGame.players
				.flatMap((playerGroup) => playerGroup.players)
				.forEach((playerInGame) => {
					OutgoingMessageHandlers.notifyAboutGameCollapsed(playerInGame.player, currentGame)
				})
			GameHistoryDatabase.closeGame(currentGame, 'Unhandled error (Spectator action)', null)
			GameLibrary.destroyGame(currentGame, 'Unhandled error (Spectator action)')
		}
	})

	ws.on('close', () => {
		spectatedPlayer.player.removeSpectator(currentSpectator)
	})

	OutgoingMessageHandlers.notifyAboutInitRequested(currentSpectator.player)
})

router.get(
	'/deck',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
		if (!currentPlayer) {
			throw genericError({
				status: 401,
				error: 'No player token provided',
			})
		}

		const currentPlayerInGame = currentPlayer.playerInGame
		if (!currentPlayerInGame) {
			throw genericError({
				status: 403,
				error: 'Player is not in the game',
			})
		}

		const cardMessages = currentPlayerInGame.cardDeck.allCards.map((card) => ({
			...new OpenCardMessage(card),
			id: card.id.replace(/card:[a-zA-Z_0-9]+:/g, 'card::'),
		}))
		res.json(shuffle(cardMessages))
	})
)

router.get(
	'/graveyard',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
		if (!currentPlayer) {
			throw genericError({
				status: 401,
				error: 'No player token provided',
			})
		}

		const currentPlayerInGame = currentPlayer.playerInGame
		if (!currentPlayerInGame) {
			throw genericError({
				status: 403,
				error: 'Player is not in the game',
			})
		}

		const cardMessages = currentPlayerInGame.cardGraveyard.allCards.map((card) => new OpenCardMessage(card))
		res.json(shuffle(cardMessages))
	})
)

router.get(
	'/opponent/graveyard',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer: ServerPlayer | null = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
		if (!currentPlayer) {
			throw genericError({
				status: 401,
				error: 'No player token provided',
			})
		}

		const currentPlayerInGame = currentPlayer.playerInGame
		if (!currentPlayerInGame) {
			throw genericError({
				status: 403,
				error: 'Player is not in the game',
			})
		}

		const opponent = currentPlayerInGame.opponentNullable
		if (!opponent) {
			throw genericError({
				status: 400,
				error: 'No opponent available',
			})
		}
		const cardMessages = opponent.players[0].cardGraveyard.allCards.map((card) => new OpenCardMessage(card))
		res.json(shuffle(cardMessages))
	})
)

module.exports = router
