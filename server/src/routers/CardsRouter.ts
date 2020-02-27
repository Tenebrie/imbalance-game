import express, { Response } from 'express'
const router = express.Router()

import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res, next) => {
	const cards = CardLibrary.cards.map(card => CardMessage.fromCard(card))

	res.json(cards)
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
