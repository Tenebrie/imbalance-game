import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../../11-testing/TestingUnitNoEffect'
import TestingUnitUntargetable from '../../../11-testing/TestingUnitUntargetable'
import SpellTacticalAdvance from './SpellTacticalAdvance'

const CardInTesting = SpellTacticalAdvance

describe('SpellTacticalAdvance', () => {
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
			expect(game.board.find(TestingUnitNoEffect).getRow()).toEqual('middle')
		})
	})

	describe('when an ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage to the enemy', () => {
			const card = game.player.find(TestingUnit100Power)
			expect(card.stats.power).toEqual(card.stats.basePower)
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
			expect(game.board.find(TestingUnit100Power).getRow()).toEqual('front')
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

		it('deals damage to the enemy', () => {
			const card = game.opponent.find(TestingUnit100Power)
			expect(card.stats.power).toEqual(card.stats.basePower - SpellTacticalAdvance.BASE_DAMAGE)
		})
	})

	describe('when two enemies are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.opponent.summon(TestingUnit100Power)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('deals damage to both enemies', () => {
			const firstCard = game.opponent.findAt(TestingUnit100Power, 0)
			expect(firstCard.stats.power).toEqual(firstCard.stats.basePower - SpellTacticalAdvance.BASE_DAMAGE)
			const secondCard = game.opponent.findAt(TestingUnit100Power, 1)
			expect(secondCard.stats.power).toEqual(secondCard.stats.basePower - SpellTacticalAdvance.BASE_DAMAGE)
		})
	})

	describe('when three enemies are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.opponent.summon(TestingUnit100Power)
			game.opponent.summon(TestingUnit100Power)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst().targetFirst()
		})

		it('deals damage only to the enemy in the middle', () => {
			const firstCard = game.opponent.findAt(TestingUnit100Power, 0)
			expect(firstCard.stats.power).toEqual(firstCard.stats.basePower)
			const secondCard = game.opponent.findAt(TestingUnit100Power, 1)
			expect(secondCard.stats.power).toEqual(secondCard.stats.basePower - SpellTacticalAdvance.BASE_DAMAGE)
			const thirdCard = game.opponent.findAt(TestingUnit100Power, 2)
			expect(thirdCard.stats.power).toEqual(thirdCard.stats.basePower)
		})
	})
})
