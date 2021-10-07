import DiscordIntegration from '@src/game/integrations/DiscordIntegration'
import { genericError } from '@src/middleware/GenericErrorMiddleware'
import AsyncHandler from '@src/utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest } from '@src/utils/Utils'
import express, { Request, Response } from 'express'

import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	res.send("You're doing great! 👍")
})

router.post(
	'/',
	AsyncHandler(async (req: Request, res: Response, _next: () => void) => {
		const feedback = req.body['feedbackBody'] as string
		const contactInfo = req.body['contactInfoBody'] as string

		if (feedback.trim().length === 0) {
			throw genericError({ status: 400, error: 'feedbackBody is empty' })
		}

		if (feedback.trim().length > 4096) {
			throw genericError({ status: 400, error: 'feedbackBody is over 4096 characters long' })
		}
		if (contactInfo.trim().length > 256) {
			throw genericError({ status: 400, error: 'contactInfoBody is over 256 characters long' })
		}

		const currentPlayer = getPlayerFromAuthenticatedRequest(req)
		const discordMessageSent = await DiscordIntegration.sendFeedback(currentPlayer, feedback, contactInfo)
		if (!discordMessageSent) {
			throw genericError({ status: 500, error: 'Unable to send Discord message.' })
		}

		res.status(204)
		res.send()
	})
)

module.exports = router
