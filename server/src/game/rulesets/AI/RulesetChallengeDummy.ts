import Constants from '@src/../../shared/src/Constants'
import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetChallengeDummy extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
			sortPriority: 0,
		})

		this.createAI([
			LeaderChallengeDummy,
			HeroChallengeDummyWarrior0,
			HeroChallengeDummyWarrior1,
			HeroChallengeDummyWarrior2,
			HeroChallengeDummyWarrior3,
			{ card: UnitChallengeDummyRoyalWarrior, count: Constants.CARD_LIMIT_SILVER },
			{ card: UnitChallengeDummyVanillaWarrior, count: Constants.CARD_LIMIT_BRONZE },
		])
	}
}
