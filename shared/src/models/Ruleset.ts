import GameMode from '../enums/GameMode'
import RulesetCategory from '../enums/RulesetCategory'
import { RulesetConstants } from './RulesetConstants'

export default interface Ruleset {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number
	playerDeckRequired: boolean

	constants: RulesetConstants
}
