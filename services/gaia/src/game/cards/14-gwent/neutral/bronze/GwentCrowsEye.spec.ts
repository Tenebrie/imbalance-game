import TestingUnit2Power from '@src/game/cards/11-testing/TestingUnit2Power'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentCrowsEye from './GwentCrowsEye'

const CardInTesting = GwentCrowsEye

describe('GwentCrowsEye', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('when no targets', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('when allies are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play()
		})

		it('does not deal damage to allies', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100)
		})
	})

	describe('when enemies are present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit2Power, 'front')
			game.opponent.summon(TestingUnit2Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.player.add(CardInTesting).play()
		})

		it('deals damage to highest units', () => {
			expect(game.board.findAt(TestingUnit100Power, 0).stats.power).toEqual(100 - GwentCrowsEye.BASE_DAMAGE)
			expect(game.board.findAt(TestingUnit100Power, 1).stats.power).toEqual(100 - GwentCrowsEye.BASE_DAMAGE)
		})

		it('does not deal damage to other units', () => {
			expect(game.board.findAt(TestingUnit2Power, 0).stats.power).toEqual(2)
			expect(game.board.findAt(TestingUnit2Power, 1).stats.power).toEqual(2)
		})
	})

	describe('when copies are present in graveyard', () => {
		beforeEach(() => {
			game.player.graveyard.add(CardInTesting)
			game.player.graveyard.add(CardInTesting)
			game.player.graveyard.add(CardInTesting)
			game.opponent.summon(TestingUnit100Power, 'front')
			game.player.add(CardInTesting).play()
		})

		it('deals bonus damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentCrowsEye.BASE_DAMAGE - GwentCrowsEye.BONUS_DAMAGE * 3)
		})
	})
})
