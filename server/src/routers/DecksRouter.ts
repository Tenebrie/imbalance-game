import uuidv4 from 'uuid/v4'
import express from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import DeckLeader from '@shared/enums/DeckLeader'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import VoidGame from '../game/utils/VoidGame'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

// TODO: Database deck saving and stuff
let decks = []

router.get('/', (req, res, next) => {
	const player = req['player'] as ServerPlayer

	if (decks.length === 0) {
		decks = [
			ServerEditorDeck.fromTemplate(DeckLeader.DEFAULT, ServerTemplateCardDeck.defaultDeck(VoidGame.get())),
			ServerEditorDeck.newDeck(DeckLeader.DEFAULT)
		]
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
	const deckData = req.body
	console.log(deckData)
	res.status(200).send()
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
