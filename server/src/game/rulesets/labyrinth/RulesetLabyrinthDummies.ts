import RulesetLabyrinthBase from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthBase'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import GameEventType from '@shared/enums/GameEventType'
import UnitChallengeDummyRoyalWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import HeroChallengeDummyWarrior0 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior3 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import HeroChallengeDummyWarrior2 from '@src/game/cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'

export default class RulesetLabyrinthDummies extends RulesetLabyrinthBase {
	constructor() {
		super()

		this.updateConstants({
			STARTING_PLAYER_MORALE: 1,
		})

		this.createBoard().opponent([
			[UnitChallengeDummyVanillaWarrior],
			[UnitChallengeDummyVanillaWarrior, UnitChallengeDummyVanillaWarrior],
			[UnitChallengeDummyVanillaWarrior, UnitChallengeDummyVanillaWarrior, UnitChallengeDummyVanillaWarrior],
		])

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
			const difficulty = state.encounterHistory.length
			const botRows = game.board.getControlledRows(game.getBotPlayer()!)
			if (difficulty >= 1) {
				botRows[1].createUnit(new UnitChallengeDummyVanillaWarrior(game), 0)
			}
			if (difficulty >= 2) {
				botRows[2].createUnit(new UnitChallengeDummyRoyalWarrior(game), 0)
			}
			if (difficulty >= 3) {
				botRows[2].createUnit(new UnitChallengeDummyRoyalWarrior(game), 4)
			}
			if (difficulty >= 4) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior0(game), 1)
			}
			if (difficulty >= 5) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior1(game), 0)
			}
			if (difficulty >= 6) {
				botRows[0].createUnit(new HeroChallengeDummyWarrior2(game), 0)
				botRows[0].createUnit(new HeroChallengeDummyWarrior3(game), 3)
			}
			if (difficulty >= 7) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
			}
			if (difficulty >= 8) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
			}
			if (difficulty >= 9) {
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
				botRows[0].createUnit(new UnitChallengeDummyOPWarrior(game), 2)
			}
		})
	}
}
