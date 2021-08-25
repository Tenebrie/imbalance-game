import GameMode from '../../../enums/GameMode'
import RulesetCategory from '../../../enums/RulesetCategory'
import Ruleset from '../Ruleset'
import { RulesetConstants } from '../RulesetConstants'
import RulesetSlots from '../RulesetSlots'

export default class RulesetMessage {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number
	playerDeckRequired: boolean
	slots: RulesetSlots

	constants: RulesetConstants

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.gameMode = ruleset.gameMode
		this.category = ruleset.category
		this.sortPriority = ruleset.sortPriority
		this.playerDeckRequired = ruleset.playerDeckRequired
		this.slots = ruleset.slots
		this.constants = {
			...ruleset.constants,
		}
	}
}
