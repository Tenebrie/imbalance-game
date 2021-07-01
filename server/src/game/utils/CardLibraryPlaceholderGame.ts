import ServerGame from '../models/ServerGame'
import GameMode from '@shared/enums/GameMode'
import { ServerRulesetBuilder } from '../models/rulesets/ServerRulesetBuilder'
import RulesetCategory from '@shared/enums/RulesetCategory'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE })
			instance = new ServerGame({
				name: 'Card Library Placeholder Game',
				ruleset: ruleset.__build(),
			})
		}
		return instance
	},
}
