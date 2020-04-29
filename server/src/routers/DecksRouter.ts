import express from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import VoidGame from '../game/utils/VoidGame'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'
import EditorDeck from '@shared/models/EditorDeck'
import decks from './TempDeckStorage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res, next) => {
	const player = req['player'] as ServerPlayer

	if (decks.length === 0) {
		decks.push(ServerEditorDeck.fromTemplate(ServerTemplateCardDeck.defaultDeck(VoidGame.get())))
		decks.push(ServerEditorDeck.newDeck())
	}

	const libraryCards = CardLibrary.cards.map(card => CardMessage.fromCard(card))
	const remappedDecks = decks.map(deck => ({
		...deck,
		cards: deck.cards.map(card => ({
			...libraryCards.find(libraryCard => libraryCard.class === card.class),
			...card
		}))
	}))

	res.json(remappedDecks)
})

router.post('/', (req, res, next) => {
	const deck = ServerEditorDeck.newDeck()
	decks.push(deck)

	res.json(deck)
})

router.get('/:deckId', (req, res, next) => {
	const deckId = req.params.deckId
	const deck = decks.find(deck => deck.id === deckId)
	if (!deck) {
		res.status(404).send()
	}
	res.json(deck)
})

router.put('/:deckId', (req, res, next) => {
	const deckId = req.params.deckId
	const deckData = req.body as EditorDeck

	decks[decks.indexOf(decks.find(deck => deck.id === deckId))] = deckData

	res.status(200).send()
})

router.use((err, req, res, next) => {
	console.error(err)
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
