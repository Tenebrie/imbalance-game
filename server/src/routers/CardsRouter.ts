import express, {Request, Response} from 'express'
import CardLibrary from '../game/libraries/CardLibrary'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const cards = CardLibrary.cards
	const cardMessages = cards.map(card => new OpenCardMessage(card))

	res.json(cardMessages)
})

module.exports = router
