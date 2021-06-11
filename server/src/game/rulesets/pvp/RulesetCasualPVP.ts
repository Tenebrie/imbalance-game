import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetCasualPVP extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVP,
			category: RulesetCategory.PVP,
		})
	}
}
