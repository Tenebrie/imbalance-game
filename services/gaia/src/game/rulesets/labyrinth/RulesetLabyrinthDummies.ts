import GameEventType from '@shared/enums/GameEventType'
import { LabyrinthProgressionRunState } from '@shared/models/progression/LabyrinthProgressionState'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import ServerGame from '@src/game/models/ServerGame'
import BaseRulesetLabyrinthEncounter from '@src/game/rulesets/labyrinth/service/BaseRulesetLabyrinthEncounter'

export default class RulesetLabyrinthDummies extends BaseRulesetLabyrinthEncounter {
	constructor(game: ServerGame) {
		super(game, {
			constants: {
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createBoard().bot([
			[UnitChallengeDummyVanillaWarrior],
			[UnitChallengeDummyVanillaWarrior],
			[UnitChallengeDummyVanillaWarrior, UnitChallengeDummyVanillaWarrior, UnitChallengeDummyVanillaWarrior],
		])

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
			const difficulty = state.encounterHistory.length
			const bot = game.getBotPlayer()
			const botRows = game.board.getControlledRows(bot)
			if (difficulty >= 1) {
				botRows[1].createUnit(new UnitChallengeDummyVanillaWarrior(game), bot, 0)
			}
			if (difficulty >= 2) {
				botRows[2].createUnit(new UnitChallengeDummyRoyalWarrior(game), bot, 0)
			}
			if (difficulty >= 3) {
				botRows[2].createUnit(new UnitChallengeDummyRoyalWarrior(game), bot, 4)
			}
			if (difficulty >= 4) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior0(game), bot, 1)
			}
			if (difficulty >= 5) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior1(game), bot, 0)
			}
			if (difficulty >= 6) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior2(game), bot, 0)
				botRows[0].createUnit(new HeroChallengeDummyWarrior3(game), bot, 3)
			}
			if (difficulty >= 7) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
			}
			if (difficulty >= 8) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
			}
			if (difficulty >= 9) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), bot, 2)
			}
		})
	}

	isValidEncounter(state: LabyrinthProgressionRunState): boolean {
		return state.encounterHistory.length > 0
	}
}