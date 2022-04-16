import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitBoxOfCats from '../tokens/UnitBoxOfCats'
import UnitStrayCat from './UnitStrayCat'

const cardInTesting = UnitBoxOfCats

describe('UnitBoxOfCats', () => {
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

		it('does not do anything extra', () => {
			expect(game.board.count(UnitBoxOfCats)).toEqual(1)
			expect(game.board.count(UnitStrayCat)).toEqual(0)
		})
	})

	describe('on round end', () => {
		beforeEach(() => {
			game.player.summon(cardInTesting)
			game.finishCurrentRound()
		})

		it('destroys the box', () => {
			expect(game.board.count(UnitBoxOfCats)).toEqual(0)
		})

		it('summons two cats', () => {
			expect(game.board.count(UnitStrayCat)).toEqual(2)
		})

		it('summons cats on the same row', () => {
			expect(game.board.findAt(UnitStrayCat, 0).getRowDistance()).toEqual('front')
			expect(game.board.findAt(UnitStrayCat, 1).getRowDistance()).toEqual('front')
		})
	})
})
