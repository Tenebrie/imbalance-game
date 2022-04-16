import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class TestingRulesetPVPLegacy extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVP,
			category: RulesetCategory.PVP,
			constants: {
				PASSIVE_LEADERS: true,
			},
		})
	}
}
