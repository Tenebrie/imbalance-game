import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import Constants from '@shared/Constants'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'

export default class RulesetCoopChallengeDummy extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.COOP,
			category: RulesetCategory.COOP,
			sortPriority: 2,
		})

		this.createSlots()
			.addGroup([
				{
					type: 'player',
					deck: CustomDeckRules.STANDARD,
				},
				{
					type: 'player',
					deck: CustomDeckRules.STANDARD,
				},
			])
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

		this.updateConstants({
			ROUND_WINS_REQUIRED: 2,
			GAME_BOARD_ROW_COUNT: 6,
		})
	}
}
