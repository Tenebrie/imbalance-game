import { RulesetConstants } from '../ruleset/RulesetConstants'

export default class GameRulesetMessage {
	constants: RulesetConstants

	constructor(constants: RulesetConstants) {
		this.constants = { ...constants }
	}
}
