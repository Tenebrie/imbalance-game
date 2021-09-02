import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffRowBloodMoon from '../../../buffs/BuffRowBloodMoon'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitSirenEnchantress from './UnitSirenEnchantress'

describe('UnitSirenEnchantress', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})
	describe('when owner has enough mana', () => {
		beforeEach(() => {
			game.player.addSpellMana(UnitSirenEnchantress.INFUSE_COST)
			game.player.add(UnitSirenEnchantress).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('consumes mana', () => {
			expect(game.player.getSpellMana()).toEqual(0)
		})

		it('creates the row buff', () => {
			expect(game.player.frontRow().buffs.includes(BuffRowBloodMoon)).toBeTruthy()
		})
	})

	describe('when owner does not have enough mana', () => {
		beforeEach(() => {
			game.player.addSpellMana(UnitSirenEnchantress.INFUSE_COST - 1)
			game.player.add(UnitSirenEnchantress).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not affect mana', () => {
			expect(game.player.getSpellMana()).toEqual(UnitSirenEnchantress.INFUSE_COST - 1)
		})

		it('does not create the row buff', () => {
			expect(game.player.frontRow().buffs.includes(BuffRowBloodMoon)).toBeFalsy()
		})
	})
})
