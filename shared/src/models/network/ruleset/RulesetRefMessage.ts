import GameMode from '../../../enums/GameMode'
import RulesetCategory from '../../../enums/RulesetCategory'
import Ruleset from '../../Ruleset'

export default class RulesetRefMessage {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number
	playerDeckRequired: boolean

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.gameMode = ruleset.gameMode
		this.category = ruleset.category
		this.sortPriority = ruleset.sortPriority
		this.playerDeckRequired = ruleset.playerDeckRequired
	}
}
