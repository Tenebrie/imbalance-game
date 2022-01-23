import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import RulesetRitesAbandonedDummies from '@src/game/rulesets/rites/RulesetRitesAbandonedDummies'

export const getRitesEncounterDeck = (): RulesetConstructor[] => {
	return [RulesetRitesAbandonedDummies, RulesetRitesAbandonedDummies, RulesetRitesAbandonedDummies]
}
