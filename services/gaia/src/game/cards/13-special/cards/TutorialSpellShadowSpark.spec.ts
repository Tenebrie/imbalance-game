import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import SpellShadowSpark from '../../01-arcane/leaders/Nighterie/SpellShadowSpark'
import UnitFierceShadow from '../../01-arcane/tokens/UnitFierceShadow'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TutorialSpellShadowSpark from './TutorialSpellShadowSpark'

const CardInTesting = TutorialSpellShadowSpark

describe('SpellShadowSpark', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played without target', () => {
		beforeEach(() => {
			game.player.addSpellMana(10)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('summons the fierce shadow', () => {
			expect(() => game.board.find(UnitFierceShadow)).not.toThrow()
		})
	})

	describe('when played with a target', () => {
		beforeEach(() => {
			game.player.addSpellMana(10)
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage to an enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - SpellShadowSpark.BASE_DAMAGE)
		})

		it('summons only one fierce shadow', () => {
			expect(game.board.count(UnitFierceShadow)).toEqual(1)
		})
	})
})
