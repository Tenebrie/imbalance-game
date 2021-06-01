import Constants from '@src/../../shared/src/Constants'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import GameMode from '@src/../../shared/src/enums/GameMode'
import StoryCharacter from '@src/../../shared/src/enums/StoryCharacter'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetEpicDummyFight extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
		})

		this.updateConstants({
			UNIT_HAND_SIZE_STARTING: 35,
			STARTING_PLAYER_MORALE: 1,
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

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ game, player }) => player === game.getHumanPlayer())
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Rules:<br>- It is a Best-of-1.<br>- You start with your entire deck in your hand.')
					.finish()
			)
	}
}
