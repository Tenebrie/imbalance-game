import ServerGame from '../models/ServerGame'
import GameMode from '@shared/enums/GameMode'
import { ServerRulesetBuilder } from '../models/rulesets/ServerRuleset'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			instance = new ServerGame({
				name: 'Card Library Placeholder Game',
				ruleset: new ServerRulesetBuilder({ gameMode: GameMode.PVE }).__build(),
			})
		}
		return instance
	},
}
