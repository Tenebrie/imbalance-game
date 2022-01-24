import GameLibrary from '@src/game/libraries/GameLibrary'
import RulesetOvermindEvaluation from '@src/game/rulesets/other/RulesetOvermindEvaluation'
import RulesetOvermindTraining from '@src/game/rulesets/other/RulesetOvermindTraining'
import RequireDevEnvironmentMiddleware from '@src/middleware/RequireDevEnvironmentMiddleware'
import AsyncHandler from '@src/utils/AsyncHandler'
import express, { Request, Response } from 'express'

const router = express.Router()

type InputData = {
	firstAgent: string
	secondAgent: string
}[]

router.use(RequireDevEnvironmentMiddleware)

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

router.get(
	'/evaluate/:id',
	AsyncHandler(async (req: Request, res: Response, _next: () => void) => {
		const data = req.params.id as string
		console.log('Requested evaluation for agent: ', data)

		const gamesTotal = 100
		const promises = Array(gamesTotal)
			.fill(0)
			.map(() =>
				(GameLibrary.createServiceGame(RulesetOvermindEvaluation).ruleset as RulesetOvermindEvaluation).runSimulation({
					agentId: data,
				})
			)
		try {
			const responses = await Promise.all(promises)
			const gamesWon = responses.filter((r) => r.victoriousAgent === 'overmind')
			const winrate = gamesWon.length / gamesTotal
			console.log('Responding to /api/overmind/evaluate', winrate)

			res.json({
				data: winrate,
			})
		} catch (err) {
			res.status(400)
			res.send()
		}
	})
)

export default router
