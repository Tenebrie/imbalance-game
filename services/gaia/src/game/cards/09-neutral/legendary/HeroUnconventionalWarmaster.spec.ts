import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitBoxOfCats from '../tokens/UnitBoxOfCats'
import HeroUnconventionalWarmaster from './HeroUnconventionalWarmaster'

const cardInTesting = HeroUnconventionalWarmaster

describe('HeroUnconventionalWarmaster', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played', () => {
		beforeEach(() => {
			game.player.add(cardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('summons 3 boxes', () => {
			expect(game.board.count(UnitBoxOfCats)).toEqual(3)
		})

		it('gives correct ownership of boxes', () => {
			expect(() => game.player.findAt(UnitBoxOfCats, 0)).toThrow()
			expect(() => game.opponent.findAt(UnitBoxOfCats, 0)).not.toThrow()
			expect(() => game.opponent.findAt(UnitBoxOfCats, 1)).not.toThrow()
			expect(() => game.opponent.findAt(UnitBoxOfCats, 2)).not.toThrow()
			expect(() => game.opponent.findAt(UnitBoxOfCats, 3)).toThrow()
		})
	})
})
