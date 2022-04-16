import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../../11-testing/TestingUnitNoEffect'
import TestingUnitUntargetable from '../../../11-testing/TestingUnitUntargetable'
import SpellTacticalRetreat from './SpellTacticalRetreat'

const CardInTesting = SpellTacticalRetreat

describe('SpellTacticalRetreat', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
		game.player.addSpellMana(10)
	})

	describe('when targeting a row', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
		})

		it('lists exactly 2 options', () => {
			expect(game.player.add(CardInTesting).play().targetFirst().countOptions()).toEqual(2)
		})
	})

	describe('when no other cards are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('moves the unit to the target row', () => {
			expect(game.board.find(TestingUnitNoEffect).getRowDistance()).toEqual('middle')
		})
	})

	describe('when an ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power).takeDamage(50)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('heals the ally', () => {
			const card = game.player.find(TestingUnit100Power)
			expect(card.stats.power).toEqual(50 + SpellTacticalRetreat.BASE_HEALING)
		})
	})

	describe('when multiple allies are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnitUntargetable)
			game.player.summon(TestingUnitUntargetable)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('moves within the row', () => {
			expect(game.board.find(TestingUnit100Power).getRowDistance()).toEqual('front')
			expect(game.board.find(TestingUnit100Power).getRowPosition()).toEqual(1)
		})
	})

	describe('when a single enemy is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not deal damage to the enemy', () => {
			const card = game.opponent.find(TestingUnit100Power)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})
})
