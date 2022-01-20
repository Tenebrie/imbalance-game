import { RulesetObjective } from '../ruleset/RulesetObjectiveLocalization'

export default class GameStartMessage {
	objective: RulesetObjective | null
	isBoardInverted: boolean

	constructor(objective: RulesetObjective | null, isBoardInverted: boolean) {
		this.objective = objective
		this.isBoardInverted = isBoardInverted
	}
}
