import GameMode from '../../enums/GameMode'
import RulesetCategory from '../../enums/RulesetCategory'
import { RulesetConstants } from './RulesetConstants'
import { RulesetObjective } from './RulesetObjectiveLocalization'
import RulesetSlots from './RulesetSlots'

export default interface Ruleset {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number
	playerDeckRequired: boolean
	slots: RulesetSlots

	constants: RulesetConstants
	objective: RulesetObjective | null
}
