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
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import HeroFlameDancer from '@src/game/cards/01-arcane/epic/HeroFlameDancer'
import AIBehaviour from '@shared/enums/AIBehaviour'

export default class RulesetDev extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
		})

		this.createDeck().fixed([LeaderMaximilian, { card: HeroFlameDancer, count: 30 }])

		this.createAI([
			LeaderChallengeDummy,
			HeroChallengeDummyWarrior0,
			HeroChallengeDummyWarrior1,
			HeroChallengeDummyWarrior2,
			HeroChallengeDummyWarrior3,
			{ card: UnitChallengeDummyRoyalWarrior, count: Constants.CARD_LIMIT_SILVER },
			{ card: UnitChallengeDummyVanillaWarrior, count: Constants.CARD_LIMIT_BRONZE },
		]).behave(AIBehaviour.PASSIVE)
	}
}
