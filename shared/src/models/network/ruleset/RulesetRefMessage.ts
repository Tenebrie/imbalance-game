import GameMode from '../../../enums/GameMode'
import Ruleset from '../../Ruleset'

export default class RulesetRefMessage {
	class: string
	gameMode: GameMode

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.gameMode = ruleset.gameMode
	}
}
