import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'

import RulesetRitesAbandonedDummies from '../encounters/RulesetRitesAbandonedDummies'
import RulesetRitesStarvingWolves from '../encounters/RulesetRitesStarvingWolves'
import RulesetRitesIntro from '../RulesetRitesIntro'

export const getRitesEncounterDeck = (): RulesetConstructor[] => {
	return [RulesetRitesIntro, RulesetRitesStarvingWolves, RulesetRitesAbandonedDummies, RulesetRitesStarvingWolves]
}
