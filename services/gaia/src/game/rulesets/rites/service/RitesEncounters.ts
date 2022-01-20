import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import RulesetLabyrinthDummies from '@src/game/rulesets/rites/RulesetLabyrinthDummies'

export const getRitesEncounterDeck = (): RulesetConstructor[] => {
	return [RulesetLabyrinthDummies, RulesetLabyrinthDummies, RulesetLabyrinthDummies]
}
