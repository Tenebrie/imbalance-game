import express, { Request, Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import RulesetRefMessage from '@shared/models/ruleset/messages/RulesetRefMessage'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const rulesets = RulesetLibrary.rulesets
	const rulesetMessages = rulesets.map((ruleset) => new RulesetRefMessage(ruleset.__build()))

	res.json(rulesetMessages)
})

module.exports = router
