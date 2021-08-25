import ServerGame from '../models/ServerGame'
import RulesetCasualPVP from '@src/game/rulesets/pvp/RulesetCasualPVP'

let instance: ServerGame | null = null

export default {
	get(): ServerGame {
		if (!instance) {
			instance = new ServerGame({
				name: 'Card Library Placeholder Game',
				ruleset: RulesetCasualPVP,
			})
		}
		return instance
	},
}
