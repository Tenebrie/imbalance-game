import RulesetRefMessage from '@shared/models/ruleset/messages/RulesetRefMessage'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import express, { Request, Response } from 'express'

import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const rulesets = RulesetLibrary.rulesets
	const rulesetMessages = rulesets.map((ruleset) => new RulesetRefMessage(ruleset))

	res.json(rulesetMessages)
})

module.exports = router
