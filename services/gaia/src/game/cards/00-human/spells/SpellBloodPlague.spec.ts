import CardLocation from '../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import { isCardPublic } from '../../../../utils/Utils'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Armor from '../../11-testing/TestingUnit100Armor'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import SpellBloodPlague from './SpellBloodPlague'

const CardInTesting = SpellBloodPlague

describe('SpellBloodPlague', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when an allied unit is played alone', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
			game.player.add(TestingUnit100Power).play()
		})

		it('deals damage to played unit', () => {
			expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100 - SpellBloodPlague.TARGET_DAMAGE)
		})

		it('discards card from hand', () => {
			expect(() => game.player.findIn(CardInTesting, CardLocation.HAND)).toThrow()
			expect(() => game.player.findIn(CardInTesting, CardLocation.GRAVEYARD)).not.toThrow()
		})
	})

	describe('when an allied unit is played next to one unit', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
			game.player.summon(TestingUnit100Power)
			game.player.add(TestingUnit100Power).playTo('front', 1)
		})

		it('deals damage to adjacent units', () => {
			expect(game.player.findAt(TestingUnit100Power, 0).stats.power).toEqual(100 - SpellBloodPlague.ADJACENT_DAMAGE)
		})

		it("adds exactly one copy of Blood Plague to the owner's hand", () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 0)).not.toThrow()
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 1)).toThrow()
		})

		it('makes the added card public', () => {
			expect(isCardPublic(game.player.find(CardInTesting).handle)).toBeTruthy()
		})
	})

	describe('when an allied unit is played next to a unit with armor', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
			game.player.summon(TestingUnit100Armor)
			game.player.add(TestingUnit100Armor).playTo('front', 1)
		})

		it('deals damage to adjacent unit', () => {
			expect(game.player.findAt(TestingUnit100Armor, 0).stats.armor).toEqual(100 - SpellBloodPlague.ADJACENT_DAMAGE)
		})

		it('does not add any copies of Blood Plague', () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 0)).toThrow()
		})

		it('discards this card', () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.GRAVEYARD, 0)).not.toThrow()
		})
	})

	describe('when an allied unit is played between other units', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.add(TestingUnit100Power).playTo('front', 1)
		})

		it('deals damage to adjacent units', () => {
			expect(game.player.findAt(TestingUnit100Power, 0).stats.power).toEqual(100 - SpellBloodPlague.ADJACENT_DAMAGE)
			expect(game.player.findAt(TestingUnit100Power, 2).stats.power).toEqual(100 - SpellBloodPlague.ADJACENT_DAMAGE)
		})

		it("adds two copies of Blood Plague to the owner's hand", () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 0)).not.toThrow()
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 1)).not.toThrow()
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 2)).toThrow()
		})
	})

	describe('when an allied unit is played between other units', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
			game.player.endTurn()
			game.opponent.summon(TestingUnit100Power)
			game.opponent.summon(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power).playTo('front', 1)
		})

		it('does not deal any damage', () => {
			expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 1).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 2).stats.power).toEqual(100)
		})

		it('does not add any copies of Blood Plague', () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 0)).not.toThrow()
			expect(() => game.player.findInAt(CardInTesting, CardLocation.HAND, 1)).toThrow()
		})

		it('does not discard this card', () => {
			expect(() => game.player.findInAt(CardInTesting, CardLocation.GRAVEYARD, 0)).toThrow()
		})
	})
})
