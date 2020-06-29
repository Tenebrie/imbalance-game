import express, { Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import EditorDeck from '@shared/models/EditorDeck'
import EditorDeckDatabase from '../database/EditorDeckDatabase'
import AsyncHandler from '../utils/AsyncHandler'
import DeckUtils from '../utils/DeckUtils'
import GenericErrorMiddleware from '../middleware/GenericErrorMiddleware'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const decks = await EditorDeckDatabase.selectEditorDecksForPlayer(player)

	const remappedDecks = decks.map(deck => DeckUtils.populateDeck(deck))
	res.json(remappedDecks)
}))

router.get('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const deck = await EditorDeckDatabase.selectEditorDeckById(deckId)
	if (!deck) {
		res.status(404).send()
		return
	}

	const remappedDeck = DeckUtils.populateDeck(deck)
	res.json(remappedDeck)
}))

router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const deck = ServerEditorDeck.newDeck()
	const success = await EditorDeckDatabase.insertEditorDeck(player, deck.id, deck)

	res.status(success ? 200 : 400)
	res.json({
		deck: success ? deck : undefined
	})
}))

router.put('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const deckData = req.body as EditorDeck
	const player = req['player'] as ServerPlayer

	const success = await EditorDeckDatabase.insertEditorDeck(player, deckId, deckData)

	res.status(success ? 204 : 400)
	res.send()
}))

router.delete('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const player = req['player'] as ServerPlayer

	if (!deckId || deckId === 'undefined') {
		throw { status: 400, error: 'Missing deck ID' }
	}

	await EditorDeckDatabase.deleteEditorDeck(deckId, player)
	res.status(204)
	res.send()
}))

module.exports = router
