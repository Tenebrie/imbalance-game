import express from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'
import CardType from '@shared/enums/CardType'
import CardFaction from '@shared/enums/CardFaction'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req, res, next) => {
	const onlyPlayable = req.query.onlyPlayable

	let cards = CardLibrary.cards.map(card => CardMessage.fromCard(card))
	if (onlyPlayable) {
		cards = cards.filter(card => card.type === CardType.UNIT && card.faction !== CardFaction.EXPERIMENTAL)
	}

	res.json(cards)
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router
