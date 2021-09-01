import CardLocation from '@shared/enums/CardLocation'
import TestingRulesetPVP from '@src/game/rulesets/testing/TestingRulesetPVP'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import TestingSpell3ManaSalvage from '../../../11-testing/TestingSpell3ManaSalvage'
import SpellBecomeTheSalvage from './SpellBecomeTheSalvage'

describe('SpellBecomeTheSalvage', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('single use', () => {
		beforeEach(() => {
			game.player.graveyard.add(TestingSpell3ManaSalvage)
			game.player.add(SpellBecomeTheSalvage).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('adds spell mana', () => {
			expect(game.player.getSpellMana()).toEqual(3)
		})

		it('returns played card to deck', () => {
			expect(game.player.find(SpellBecomeTheSalvage).location).toEqual(CardLocation.DECK)
		})

		it('destroys the targeted card', () => {
			expect(() => game.player.find(TestingSpell3ManaSalvage)).toThrow()
		})
	})

	describe('multiple uses', () => {
		beforeEach(() => {
			game.player.graveyard.add(TestingSpell3ManaSalvage)
			game.player.graveyard.add(TestingSpell3ManaSalvage)
			game.player.graveyard.add(TestingSpell3ManaSalvage)
			game.player.add(SpellBecomeTheSalvage).play().targetFirst()
			game.player.draw(SpellBecomeTheSalvage).play().targetFirst()
			game.player.draw(SpellBecomeTheSalvage).play().targetFirst()
		})

		it('destroys the played card', () => {
			expect(() => game.player.find(SpellBecomeTheSalvage)).toThrow()
		})
	})
})
