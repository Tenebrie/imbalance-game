import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import UnitStrayCat from './UnitStrayCat'

describe('UnitStrayCat', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(UnitStrayCat).play()
			game.opponent.summon(TestingUnit100Power)
		})

		it('is played on the opponent side', () => {
			expect(() => game.player.find(UnitStrayCat)).toThrow()
		})

		it('does not damage enemies immediately', () => {
			expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 1).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 2).stats.power).toEqual(100)
		})

		describe('next turn', () => {
			beforeEach(() => {
				game.advanceTurn()
				game.advanceTurn()
			})

			it('damages only adjacent enemies', () => {
				expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100)
				expect(game.opponent.findAt(TestingUnit100Power, 1).stats.power).toEqual(100 - UnitStrayCat.DAMAGE)
				expect(game.opponent.findAt(TestingUnit100Power, 2).stats.power).toEqual(100 - UnitStrayCat.DAMAGE)
			})
		})
	})
})
