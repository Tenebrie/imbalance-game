import GameLibrary from '@src/game/libraries/GameLibrary'
import RulesetOvermindTraining from '@src/game/rulesets/other/RulesetOvermindTraining'
import AsyncHandler from '@src/utils/AsyncHandler'
import express, { Request, Response } from 'express'

const router = express.Router()

type InputData = {
	firstAgent: string
	secondAgent: string
}[]

router.get('/simulate', (req: Request, res: Response) => {
	res.json({
		error: 'NO GETS!',
	})
})

router.post(
	'/simulate',
	AsyncHandler(async (req: Request, res: Response, _next: () => void) => {
		const data = req.body['data'] as InputData
		console.log('Requested game simulation for agents: ', data)

		const promises = data.map((d) =>
			(GameLibrary.createServiceGame(RulesetOvermindTraining).ruleset as RulesetOvermindTraining).runSimulation({
				firstAgentId: d.firstAgent,
				secondAgentId: d.secondAgent,
			})
		)
		try {
			const responses = await Promise.all(promises)
			const mappedResponses = responses.map((r) => r.victoriousAgent || 'draw')
			console.log('Responding to /api/overmind/simulate', mappedResponses)

			res.json(mappedResponses)
		} catch (err) {
			console.error(err)
			res.status(400)
			res.send()
		}
	})
)

module.exports = router
