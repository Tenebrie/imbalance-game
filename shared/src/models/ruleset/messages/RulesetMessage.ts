import GameMode from '../../../enums/GameMode'
import RulesetCategory from '../../../enums/RulesetCategory'
import Ruleset from '../Ruleset'
import { RulesetConstants } from '../RulesetConstants'
import { PartialRulesetLocalization } from '../RulesetLocalization'
import { RulesetObjective } from '../RulesetObjectiveLocalization'
import RulesetSlots from '../RulesetSlots'

export default class RulesetMessage {
	public readonly class: string
	public readonly locale: PartialRulesetLocalization
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number
	public readonly playerDeckRequired: boolean
	public readonly slots: RulesetSlots

	public readonly constants: RulesetConstants
	public readonly objective: RulesetObjective | null

	constructor(ruleset: Ruleset) {
		this.class = ruleset.class
		this.locale = ruleset.locale
		this.gameMode = ruleset.gameMode
		this.category = ruleset.category
		this.sortPriority = ruleset.sortPriority
		this.playerDeckRequired = ruleset.playerDeckRequired
		this.slots = ruleset.slots
		this.constants = {
			...ruleset.constants,
		}
		this.objective = ruleset.objective
	}
}
