import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingSpell10Mana from '../../11-testing/TestingSpell10Mana'
import UnitMerchantsAssistant from './UnitMerchantsAssistant'

const CardInTesting = UnitMerchantsAssistant

describe('UnitMerchantsAssistant', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when not played', () => {
		beforeEach(() => {
			game.player.add(TestingSpell10Mana)
		})

		it('spell costs basic cost', () => {
			expect(game.player.findAt(TestingSpell10Mana, 0).stats.spellCost).toEqual(10)
		})
	})

	describe('when played with spells in hand', () => {
		beforeEach(() => {
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
			game.player.add(CardInTesting).play()
		})

		it('makes existing spells in hand cheaper', () => {
			expect(game.player.findAt(TestingSpell10Mana, 0).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
			expect(game.player.findAt(TestingSpell10Mana, 1).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
			expect(game.player.findAt(TestingSpell10Mana, 2).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
		})
	})

	describe('when receiving spells after playing', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
		})

		it('makes existing spells in hand cheaper', () => {
			expect(game.player.findAt(TestingSpell10Mana, 0).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
			expect(game.player.findAt(TestingSpell10Mana, 1).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
			expect(game.player.findAt(TestingSpell10Mana, 2).stats.spellCost).toEqual(10 - UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)
		})
	})

	describe('when a discounted spell is played', () => {
		beforeEach(() => {
			game.player.addSpellMana(10)
			game.player.add(CardInTesting).play()
			game.opponent.endTurn()
			game.player.add(TestingSpell10Mana).play()
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
		})

		it('removes discount', () => {
			expect(game.player.findAt(TestingSpell10Mana, 0).stats.spellCost).toEqual(10)
			expect(game.player.findAt(TestingSpell10Mana, 1).stats.spellCost).toEqual(10)
		})
	})

	describe('when the round ends', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
			game.player.add(TestingSpell10Mana)
			game.startNextRound()
		})

		it('removes discount', () => {
			expect(game.player.findAt(TestingSpell10Mana, 0).stats.spellCost).toEqual(10)
			expect(game.player.findAt(TestingSpell10Mana, 1).stats.spellCost).toEqual(10)
		})
	})
})
