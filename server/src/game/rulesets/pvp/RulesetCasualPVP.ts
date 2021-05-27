import GameMode from '@src/../../shared/src/enums/GameMode'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetCasualPVP extends ServerRulesetBuilder {
	constructor() {
		super({
			gameMode: GameMode.PVP,
		})
	}
}
