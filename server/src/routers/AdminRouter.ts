import AccessLevel from '@shared/enums/AccessLevel'
import GameHistoryDatabaseEntry from '@src/../../shared/src/models/GameHistoryDatabaseEntry'
import OpenCardMessage from '@src/../../shared/src/models/network/card/OpenCardMessage'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import CardLibrary from '@src/game/libraries/CardLibrary'
import express, { Response } from 'express'

import PlayerDatabase from '../database/PlayerDatabase'
import PlayerLibrary from '../game/players/PlayerLibrary'
import RequireAdminAccessLevelMiddleware from '../middleware/RequireAdminAccessLevelMiddleware'
import RequireOriginalPlayerTokenMiddleware from '../middleware/RequireOriginalPlayerTokenMiddleware'
import RequireSupportAccessLevelMiddleware from '../middleware/RequireSupportAccessLevelMiddleware'
import TokenManager from '../services/TokenService'
import AsyncHandler from '../utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest, setCookie } from '../utils/Utils'

const router = express.Router()

router.use(RequireOriginalPlayerTokenMiddleware)
router.use(RequireSupportAccessLevelMiddleware)

router.get(
	'/cards',
	AsyncHandler(async (req, res: Response) => {
		const cardEntries = CardLibrary.cards.map((card) => new OpenCardMessage(card))
		res.json(cardEntries)
	})
)

router.get(
	'/cards/:cardClass',
	AsyncHandler(async (req, res: Response) => {
		const targetCardClass = req.params['cardClass']
		const targetCard = CardLibrary.cards.find((card) => card.class === targetCardClass)
		if (!targetCard) {
			throw { status: 500, error: `No card exists with class ${targetCardClass}` }
		}

		res.json(new OpenCardMessage(targetCard))
	})
)

router.get(
	'/games',
	AsyncHandler(async (req, res: Response) => {
		const targetPlayerId = req.query['player'] || null
		let gameEntries = await GameHistoryDatabase.selectAllGames()
		if (!gameEntries) {
			throw { status: 500, error: `Unable to fetch game records from the database` }
		}

		gameEntries = gameEntries.map<GameHistoryDatabaseEntry>((entry) => ({
			...entry,
			eventLog: [],
		}))
		if (targetPlayerId) {
			gameEntries = gameEntries.filter((entry) => entry.players.find(({ id }) => id === targetPlayerId))
		}
		res.json(gameEntries)
	})
)

router.get(
	'/games/:gameId',
	AsyncHandler(async (req, res: Response) => {
		const targetGameId = req.params['gameId']
		const response = await GameHistoryDatabase.selectGameById(targetGameId)
		if (response === null) {
			throw { status: 500, error: 'Unable to select game entry from database' }
		}

		res.json(response)
	})
)

router.get(
	'/games/:gameId/errors',
	AsyncHandler(async (req, res: Response) => {
		const targetGameId = req.params['gameId']
		if (!targetGameId) {
			throw { status: 400, error: 'Missing gameId' }
		}

		const response = await GameHistoryDatabase.selectGameErrors(targetGameId)
		if (response === null) {
			throw { status: 500, error: 'Unable to select game error entries from database' }
		}

		res.json(response)
	})
)

router.get(
	'/players',
	AsyncHandler(async (req, res: Response) => {
		const playerEntries = await PlayerDatabase.selectAllPlayers()
		res.json(playerEntries)
	})
)

router.get(
	'/players/:playerId',
	AsyncHandler(async (req, res: Response) => {
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		const response = await PlayerDatabase.selectPlayerById(targetPlayerId)
		if (response === null) {
			throw { status: 500, error: 'Unable to select player from database' }
		}

		res.json(response)
	})
)

router.use(RequireAdminAccessLevelMiddleware)

router.post(
	'/players/:playerId/login',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer = getPlayerFromAuthenticatedRequest(req)
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		if (currentPlayer.id === targetPlayerId) {
			throw { status: 403, error: 'Unable to impersonate self' }
		}

		const player = await PlayerLibrary.loginById(targetPlayerId)
		if (!player) {
			throw { status: 400, error: 'Player id invalid' }
		}

		if (player.accessLevel === AccessLevel.DISABLED) {
			throw { status: 400, error: 'Target player is disabled' }
		}

		const playerToken = TokenManager.generateJwtToken(player)
		const originalPlayerToken = TokenManager.generateJwtToken(currentPlayer)
		setCookie(res, 'playerToken', playerToken)
		setCookie(res, 'originalPlayerToken', originalPlayerToken)

		res.status(204)
		res.send()
	})
)

router.delete(
	'/players/:playerId',
	AsyncHandler(async (req, res: Response) => {
		const targetPlayerId = req.params['playerId']
		if (!targetPlayerId) {
			throw { status: 400, error: 'Missing playerId' }
		}

		await PlayerDatabase.deletePlayer(targetPlayerId)
		res.status(204)
		res.send()
	})
)

router.post(
	'/players/:playerId/accessLevel',
	AsyncHandler(async (req, res: Response) => {
		const currentPlayer = getPlayerFromAuthenticatedRequest(req)
		const targetPlayerId = req.params['playerId']
		const accessLevel = req.body['accessLevel'] as AccessLevel
		if (!targetPlayerId || !accessLevel) {
			throw { status: 400, error: 'Missing playerId or accessLevel' }
		}

		if (currentPlayer.id === targetPlayerId) {
			throw { status: 403, error: 'Unable to edit self' }
		}

		await PlayerLibrary.updateAccessLevel(targetPlayerId, accessLevel)

		res.status(204)
		res.send()
	})
)

module.exports = router
