import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetEpicDummyFight extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
			sortPriority: 1,
			constants: {
				GAME_BOARD_ROW_COUNT: 8,
				UNIT_HAND_SIZE_STARTING: 35,
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: CustomDeckRules.STANDARD,
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

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ game, group }) => group === game.getHumanGroup())
			.perform(({ game }) =>
				game.novel.startDialog(`
					Narrator:
					> Rules:
						> It is a Best-of-1
						> You start with your entire deck in your hand.
				`)
			)
	}
}
