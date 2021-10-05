import Constants from '../../../../../../../shared/src/Constants'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitHarmlessShadow from '../tokens/UnitHarmlessShadow'
import HeroLearthe from './HeroLearthe'

const CardInTesting = HeroLearthe

describe('HeroLearthe', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when targeting allied row', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play().targetLast()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('fills it with shadows', () => {
			expect(game.player.countOnRow(UnitHarmlessShadow, 2)).toEqual(Constants.MAX_CARDS_PER_ROW)
		})

		it('summoned shadows are allied', () => {
			expect(() => game.player.find(UnitHarmlessShadow)).not.toThrow()
		})
	})

	describe("when targeting opponent's row", () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('fills it with shadows', () => {
			expect(game.opponent.countOnRow(UnitHarmlessShadow, 2)).toEqual(Constants.MAX_CARDS_PER_ROW)
		})

		it('summoned shadows belong to the opponent', () => {
			expect(() => game.opponent.find(UnitHarmlessShadow)).not.toThrow()
		})
	})
})
