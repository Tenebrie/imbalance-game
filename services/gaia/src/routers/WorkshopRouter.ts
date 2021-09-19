import AsyncHandler from '@src/utils/AsyncHandler'
import { cardImageGenerator } from '@src/utils/CardImageGenerator'
import express, { Response } from 'express'

import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get(
	'/artwork',
	AsyncHandler(async (req, res: Response) => {
		const seed = req.query['seed'] as string
		if (!seed) {
			throw { status: 400, error: 'Seed query param is required' }
		}

		const image = await cardImageGenerator.generateInMemoryPlaceholderImage(seed, '')
		res.status(200).contentType('image/png').send(image)
	})
)

module.exports = router
