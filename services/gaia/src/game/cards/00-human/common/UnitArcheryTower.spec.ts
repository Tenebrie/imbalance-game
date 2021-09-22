import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit5PowerVoidspawn from '../../11-testing/TestingUnit5PowerVoidspawn'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitElemental from '../../11-testing/TestingUnitElemental'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import TestingUnitSoldier from '../../11-testing/TestingUnitSoldier'
import UnitArcheryTower from './UnitArcheryTower'

const CardInTesting = UnitArcheryTower

describe('UnitArcheryTower', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on an empty board', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
		})

		it('has no valid order', () => {
			expect(() => game.board.find(CardInTesting).orderOnFirst()).toThrow()
		})
	})

	describe('with an enemy', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.opponent.summon(TestingUnitNoEffect)
		})

		it('has no valid order', () => {
			expect(() => game.board.find(CardInTesting).orderOnFirst()).toThrow()
		})
	})

	describe('with adjacent allies', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitElemental)
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.opponent.summon(TestingUnit100Power)
		})

		it('has no valid order', () => {
			expect(() => game.board.find(CardInTesting).orderOnFirst()).toThrow()
		})
	})

	describe('with an adjacent soldier', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitSoldier)
			game.opponent.summon(TestingUnit100Power)
		})

		it('has a valid order', () => {
			expect(() => game.board.find(CardInTesting).orderOnFirst()).not.toThrow()
		})

		it('attacks the enemy on order', () => {
			game.board.find(CardInTesting).orderOnFirst()
			expect(game.opponent.find(TestingUnit100Power).stats.power).toEqual(100 - UnitArcheryTower.BASE_DAMAGE)
		})

		it('attacks the enemy only once', () => {
			game.board.find(CardInTesting).orderOnFirst()
			expect(() => game.board.find(CardInTesting).orderOnFirst()).toThrow()
		})
	})

	describe('with two adjacent soldiers', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitSoldier)
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitSoldier)
			game.opponent.summon(TestingUnit100Power)
		})

		it('has a valid order', () => {
			expect(() => game.board.find(CardInTesting).orderOnFirst()).not.toThrow()
		})

		it('attacks the enemy on order twice', () => {
			game.board.find(CardInTesting).orderOnFirst()
			game.board.find(CardInTesting).orderOnFirst()
			expect(game.opponent.find(TestingUnit100Power).stats.power).toEqual(100 - UnitArcheryTower.BASE_DAMAGE * 2)
		})

		it('attacks the enemy only twice', () => {
			game.board.find(CardInTesting).orderOnFirst()
			game.board.find(CardInTesting).orderOnFirst()
			expect(() => game.board.find(CardInTesting).orderOnFirst()).toThrow()
		})
	})
})
