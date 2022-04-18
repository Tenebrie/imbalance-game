import TestingUnit2Power from '@src/game/cards/11-testing/TestingUnit2Power'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentRockBarrage from './GwentRockBarrage'

const CardInTesting = GwentRockBarrage

describe('GwentRockBarrage', () => {
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

	describe('when row above is free', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentRockBarrage.DAMAGE)
		})

		it('moves the target back', () => {
			expect(game.board.find(TestingUnit100Power).getRowDistance()).toEqual('middle')
		})
	})

	describe('when row above is full', () => {
		beforeEach(() => {
			game.opponent.fillRow(TestingUnit2Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.player.add(CardInTesting).play().targetLast()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('destroys the target', () => {
			expect(() => game.board.find(TestingUnit100Power)).toThrow()
		})
	})

	describe('when on last row', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power, 'back')
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentRockBarrage.DAMAGE)
		})

		it('does not move the target', () => {
			expect(game.board.find(TestingUnit100Power).getRowDistance()).toEqual('back')
		})
	})

	describe('when target dies from damage', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit2Power, 'front')
			game.player.add(CardInTesting).play().targetLast()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('destroys the target', () => {
			expect(() => game.board.find(TestingUnit2Power)).toThrow()
		})
	})
})
