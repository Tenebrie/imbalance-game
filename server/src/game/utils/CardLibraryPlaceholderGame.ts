import ServerGame from '../models/ServerGame'
import GameMode from '@shared/enums/GameMode'
import { ServerRulesetBuilder } from '../models/rulesets/ServerRulesetBuilder'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			instance = new ServerGame({
				name: 'Card Library Placeholder Game',
				ruleset: new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build(),
			})
		}
		return instance
	},
}
