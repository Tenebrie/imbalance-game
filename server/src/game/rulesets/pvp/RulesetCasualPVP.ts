import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'

export default class RulesetCasualPVP extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVP,
			category: RulesetCategory.PVP,
		})
	}
}
