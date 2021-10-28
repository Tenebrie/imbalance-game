import Constants from '../../../../../../../../shared/src/Constants'
import CardLocation from '../../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../../11-testing/TestingUnitNoEffect'
import HeroFormidia from './HeroFormidia'
import HeroFormidiaShade from './HeroFormidiaShade'

describe('HeroFormidia', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when Formidia is played', () => {
		beforeEach(() => {
			game.player.add(HeroFormidia).play()
		})

		it('creates the shade card', () => {
			expect(() => game.player.find(HeroFormidiaShade)).not.toThrow()
		})

		it('adds the shade card to hand', () => {
			expect(game.player.find(HeroFormidiaShade).location).toEqual(CardLocation.HAND)
		})
	})

	describe('when the shade is played', () => {
		describe('without preparation', () => {
			beforeEach(() => {
				game.player.add(HeroFormidiaShade).play()
			})

			it('allows another unit to be played on the same turn', () => {
				expect(() => game.player.add(TestingUnitNoEffect).play()).not.toThrow()
			})
		})

		describe('after no units have died', () => {
			beforeEach(() => {
				game.player.add(HeroFormidia).play()
				game.opponent.endTurn()
				game.player.find(HeroFormidiaShade).play()
			})

			it("doesn't create other units", () => {
				expect(game.board.countAll()).toEqual(2)
			})
		})

		describe('after some units have died', () => {
			beforeEach(() => {
				game.player.add(HeroFormidia).play()
				game.player.summon(TestingUnit100Power).takeDamage(100)
				game.player.summon(TestingUnit100Power).takeDamage(100)
				game.opponent.summon(TestingUnit100Power).takeDamage(100)
				game.opponent.summon(TestingUnit100Power).takeDamage(100)
				game.opponent.endTurn()
				game.player.find(HeroFormidiaShade).play()
			})

			it('summons the right number of units', () => {
				expect(game.board.countAll()).toEqual(6)
			})

			it('summons the copied units', () => {
				expect(() => game.player.findAt(TestingUnit100Power, 0)).not.toThrow()
				expect(() => game.player.findAt(TestingUnit100Power, 1)).not.toThrow()
				expect(() => game.opponent.findAt(TestingUnit100Power, 0)).not.toThrow()
				expect(() => game.opponent.findAt(TestingUnit100Power, 1)).not.toThrow()
			})

			describe('when shade is returned and played again', () => {
				beforeEach(() => {
					game.player.find(HeroFormidiaShade).getUnit().returnToHand().play()
				})

				it('does not summon any more units', () => {
					expect(game.board.countAll()).toEqual(6)
				})
			})
		})

		describe('after many units have died', () => {
			beforeEach(() => {
				game.player.add(HeroFormidia).play()
				for (let i = 0; i < 50; i++) {
					game.player.summon(TestingUnit100Power).takeDamage(100)
				}
				game.opponent.endTurn()
				game.player.find(HeroFormidiaShade).play()
			})

			it('fills the entire board', () => {
				expect(game.board.countAll()).toEqual(Constants.MAX_CARDS_PER_ROW * 3)
			})
		})

		describe('after Formidia has died', () => {
			beforeEach(() => {
				game.player.add(HeroFormidia).play()
				game.player.find(HeroFormidia).takeDamage(1000)
				game.opponent.endTurn()
				game.player.find(HeroFormidiaShade).play()
			})

			it('does not resummon Formidia', () => {
				expect(game.board.count(HeroFormidia)).toEqual(0)
			})
		})
	})
})
