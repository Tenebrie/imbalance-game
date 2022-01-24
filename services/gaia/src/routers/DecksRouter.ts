import ErrorCode from '@shared/enums/ErrorCode'
import EditorDeck from '@shared/models/EditorDeck'
import { genericError } from '@src/middleware/GenericErrorMiddleware'
import express, { Response } from 'express'
import rateLimit from 'express-rate-limit'

import EditorDeckDatabase from '../database/EditorDeckDatabase'
import SharedDeckDatabase from '../database/SharedDeckDatabase'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import ServerPlayer from '../game/players/ServerPlayer'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import AsyncHandler from '../utils/AsyncHandler'
import DeckUtils from '../utils/DeckUtils'
import { createRandomEditorDeckId, generateShortId, validateEditorDeck } from '../utils/Utils'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get(
	'/',
	AsyncHandler(async (req, res: Response) => {
		const player = req['player'] as ServerPlayer
		const decks = await EditorDeckDatabase.selectEditorDecksForPlayer(player)
		if (!decks) {
			res.json([])
			return
		}

		const populatedDecks = decks.map((deck) => DeckUtils.populateDeck(deck))
		res.json(populatedDecks)
	})
)

router.get(
	'/:deckId',
	AsyncHandler(async (req, res: Response) => {
		const player = req['player'] as ServerPlayer
		const deckId = req.params.deckId
		const deck = await EditorDeckDatabase.selectEditorDeckByIdForPlayer(deckId, player)
		if (!deck) {
			throw { status: 404, error: 'Deck not found' }
		}

		const populatedDeck = DeckUtils.populateDeck(deck)
		res.json(populatedDeck)
	})
)

router.post(
	'/:deckId/share',
	AsyncHandler(async (req, res: Response) => {
		const deckId = req.params.deckId
		const deck = await EditorDeckDatabase.selectEditorDeckById(deckId)
		if (!deck) {
			throw { status: 404, error: 'Deck not found' }
		}

		const code = generateShortId(8)
		const deckInserted = await SharedDeckDatabase.insertSharedDeck(code, deck)
		if (!deckInserted) {
			throw { status: 500, error: 'Generic database error' }
		}

		res.json({
			data: code,
		})
	})
)

router.post(
	'/',
	rateLimit({
		windowMs: 15 * 1000,
		max: 3,
	})
)

router.post(
	'/',
	AsyncHandler(async (req, res: Response) => {
		const player = req['player'] as ServerPlayer
		const sharedDeckId = req.body.sharedCode
		let deck
		if (sharedDeckId) {
			deck = await SharedDeckDatabase.selectSharedDeckById(sharedDeckId, createRandomEditorDeckId())
			await SharedDeckDatabase.updateSharedDeckTimestamp(sharedDeckId)
		} else {
			deck = ServerEditorDeck.newDeck()
		}
		const success = deck ? await EditorDeckDatabase.insertEditorDeck(player, deck) : false

		res.status(success ? 200 : 400)
		res.json({
			deck: success ? deck : undefined,
		})
	})
)

router.put(
	'/:deckId',
	AsyncHandler(async (req, res: Response) => {
		const deckData = req.body as EditorDeck
		const player = req['player'] as ServerPlayer

		const deckValidationStatus = validateEditorDeck(deckData)
		if (!deckValidationStatus.valid) {
			throw genericError({
				status: 400,
				error: 'Invalid deck composition',
				code: ErrorCode.INVALID_DECK_COMPOSITION,
				data: {
					badCards: deckValidationStatus.badCards,
				},
			})
		}

		const success = await EditorDeckDatabase.insertEditorDeck(player, deckData)

		res.status(success ? 204 : 400)
		res.send()
	})
)

router.delete(
	'/:deckId',
	AsyncHandler(async (req, res: Response) => {
		const deckId = req.params.deckId
		const player = req['player'] as ServerPlayer

		if (!deckId || deckId === 'undefined') {
			throw { status: 400, error: 'Missing deck ID' }
		}

		await EditorDeckDatabase.deleteEditorDeck(deckId, player)
		res.status(204)
		res.send()
	})
)

export default router
