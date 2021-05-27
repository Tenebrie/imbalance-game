import GameMode from '../enums/GameMode'
import { RulesetConstants } from './RulesetConstants'

export default interface Ruleset {
	class: string
	gameMode: GameMode

	constants: RulesetConstants
}
