import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import UnitFierceShadow from '../../tokens/UnitFierceShadow'
import SpellShadowSpark from './SpellShadowSpark'

const CARD_IN_TESTING = SpellShadowSpark

describe('SpellShadowSpark', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played without target', () => {
		beforeEach(() => {
			game.player.addSpellMana(10)
			game.player.add(CARD_IN_TESTING).play()
		})

		it('resolves the cards', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('summons the fierce shadow', () => {
			expect(() => game.board.find(UnitFierceShadow)).not.toThrow()
		})
	})
})
