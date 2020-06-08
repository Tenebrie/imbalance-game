import express from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res, next) => {
	const collectible = req.query.collectible

	const cards = collectible ? CardLibrary.collectibleCards : CardLibrary.cards
	const cardMessages = cards.map(card => CardMessage.fromCard(card))

	res.json(cardMessages)
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
