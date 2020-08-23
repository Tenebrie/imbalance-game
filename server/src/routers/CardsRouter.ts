import express from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res, next) => {
	const cards = CardLibrary.cards
	const cardMessages = cards.map(card => CardMessage.fromCard(card))

	res.json(cardMessages)
})

module.exports = router
