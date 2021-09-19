import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffStrength from '../../../buffs/BuffStrength'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitExtraArmorSelector from '../../11-testing/TestingUnitExtraArmorSelector'
import UnitAnimatedShield from './UnitAnimatedShield'

const CardInTesting = UnitAnimatedShield

describe('UnitAnimatedShield', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('without extra effects', () => {
		describe('in deck', () => {
			beforeEach(() => {
				game.player.deck.add(CardInTesting)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor)
			})
		})

		describe('in hand', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor)
			})
		})

		describe('on board', () => {
			beforeEach(() => {
				game.player.summon(CardInTesting)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor)
			})
		})
	})

	describe('with extra armor', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitExtraArmorSelector)
		})

		describe('in deck', () => {
			beforeEach(() => {
				game.player.deck.add(CardInTesting)
			})

			it('has the extra power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor + 1)
			})
		})

		describe('in hand', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor + 1)
			})
		})

		describe('on board', () => {
			beforeEach(() => {
				game.player.summon(CardInTesting)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor + 1)
			})
		})
	})

	describe('after taking damage', () => {
		describe('in hand', () => {
			beforeEach(() => {
				game.player.add(CardInTesting).takeDamage(3)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor - 3)
			})
		})

		describe('on board', () => {
			beforeEach(() => {
				game.player.summon(CardInTesting).takeDamage(3)
			})

			it('has the power', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.baseArmor - 3)
			})
		})
	})

	describe('when given extra power', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting).buffs.add(BuffStrength)
		})

		it('does not get extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.baseArmor)
		})
	})
})
