import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffStrength from '../../../buffs/BuffStrength'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit5PowerVoidspawn from '../../11-testing/TestingUnit5PowerVoidspawn'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import UnitVoidslinger from './UnitVoidslinger'

describe('UnitVoidslinger', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when an enemy is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(UnitVoidslinger).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('destroys the ally', () => {
			expect(() => game.board.find(TestingUnit5PowerVoidspawn)).toThrow()
		})

		it('deals damage to the enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(95)
		})
	})

	describe('when an ally has a buff', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn).buffs.add(BuffStrength)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(UnitVoidslinger).play().targetFirst().targetFirst()
		})

		it('deals extra damage to the enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(94)
		})
	})

	describe('when no ally is present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.player.add(UnitVoidslinger).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not deal damage to an enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100)
		})
	})

	describe('when no enemy is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.add(UnitVoidslinger).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('destroys the ally', () => {
			expect(() => game.board.find(TestingUnit5PowerVoidspawn)).toThrow()
		})
	})
})
