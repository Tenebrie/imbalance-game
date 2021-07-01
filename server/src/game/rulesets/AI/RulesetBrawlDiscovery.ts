import Constants from '@shared/Constants'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderTheScavenger from '@src/game/cards/09-neutral/leaders/TheScavenger/LeaderTheScavenger'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import HeroChallengeLegendaryExplorer0 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer0'
import HeroChallengeLegendaryExplorer1 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer1'
import HeroChallengeLegendaryExplorer2 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer2'
import HeroChallengeLegendaryExplorer3 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer3'
import UnitChallengeEagerExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeEagerExplorer'
import UnitChallengeScarredExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeScarredExplorer'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import AIBehaviour from '@shared/enums/AIBehaviour'

export default class RulesetBrawlDiscovery extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
			sortPriority: 1,
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [
					LeaderTheScavenger,
					HeroChallengeLegendaryExplorer0,
					HeroChallengeLegendaryExplorer1,
					HeroChallengeLegendaryExplorer2,
					HeroChallengeLegendaryExplorer3,
					{ card: UnitChallengeScarredExplorer, count: Constants.CARD_LIMIT_SILVER },
					{ card: UnitChallengeEagerExplorer, count: Constants.CARD_LIMIT_BRONZE },
				],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [
					LeaderChallengeDummy,
					HeroChallengeDummyWarrior0,
					HeroChallengeDummyWarrior1,
					HeroChallengeDummyWarrior2,
					HeroChallengeDummyWarrior3,
					{ card: UnitChallengeDummyRoyalWarrior, count: Constants.CARD_LIMIT_SILVER },
					{ card: UnitChallengeDummyVanillaWarrior, count: Constants.CARD_LIMIT_BRONZE },
				],
			})
	}
}
