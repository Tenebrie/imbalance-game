import GameMode from '../../../enums/GameMode'
import RulesetCategory from '../../../enums/RulesetCategory'
import Ruleset from '../Ruleset'

export default class RulesetRefMessage {
	public readonly class: string
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number
	public readonly playerDeckRequired: boolean

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.gameMode = ruleset.gameMode
		this.category = ruleset.category
		this.sortPriority = ruleset.sortPriority
		this.playerDeckRequired = ruleset.playerDeckRequired
	}
}
