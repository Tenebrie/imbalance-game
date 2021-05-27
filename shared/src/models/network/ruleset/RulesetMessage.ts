import GameMode from '../../../enums/GameMode'
import Ruleset from '../../Ruleset'
import { RulesetConstants } from '../../RulesetConstants'

export default class RulesetMessage {
	class: string
	gameMode: GameMode

	constants: RulesetConstants

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.gameMode = ruleset.gameMode
		this.constants = {
			...ruleset.constants,
		}
	}
}
