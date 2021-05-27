import express, { Request, Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import RulesetRefMessage from '@shared/models/network/ruleset/RulesetRefMessage'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const rulesets = RulesetLibrary.rulesets
	const rulesetMessages = rulesets.map((ruleset) => new RulesetRefMessage(ruleset.__build()))

	res.json(rulesetMessages)
})

module.exports = router
