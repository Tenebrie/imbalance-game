import { setupTestGame, TestGame } from '@src/utils/TestGame'
import { mockRandomForEach } from 'jest-mock-random'

import TestingUnit2Power from '../cards/11-testing/TestingUnit2Power'
import TestingUnit100Power from '../cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '../rulesets/testing/TestingRulesetGwent'
import ServerCard from './ServerCard'

describe('ServerDeck', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('shuffleUnitIn', () => {
		let targetUnit: ServerCard
		let paddingUnits: ServerCard[]
		beforeEach(() => {
			targetUnit = new TestingUnit100Power(game.handle)
			paddingUnits = [new TestingUnit2Power(game.handle), new TestingUnit2Power(game.handle), new TestingUnit2Power(game.handle)]
		})

		describe('when deck has 0 cards', () => {
			describe('when random rolls 0', () => {
				mockRandomForEach([0])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.25', () => {
				mockRandomForEach([0.25])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.5', () => {
				mockRandomForEach([0.5])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.99', () => {
				mockRandomForEach([0.99])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})
		})

		describe('when deck has 1 card', () => {
			beforeEach(() => {
				game.player.handle.cardDeck.addUnitToTop(paddingUnits[0])
			})

			describe('when random rolls 0', () => {
				mockRandomForEach([0])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.25', () => {
				mockRandomForEach([0.25])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.5', () => {
				mockRandomForEach([0.5])

				it('shuffles unit to 1st index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(1)
				})
			})

			describe('when random rolls 0.99', () => {
				mockRandomForEach([0.99])

				it('shuffles unit to 1st index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(1)
				})
			})
		})

		describe('when deck has many cards', () => {
			beforeEach(() => {
				game.player.handle.cardDeck.addUnitToTop(paddingUnits[0])
				game.player.handle.cardDeck.addUnitToTop(paddingUnits[1])
				game.player.handle.cardDeck.addUnitToTop(paddingUnits[2])
			})

			describe('when random rolls 0', () => {
				mockRandomForEach([0])

				it('shuffles unit to 0th index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(0)
				})
			})

			describe('when random rolls 0.25', () => {
				mockRandomForEach([0.25])

				it('shuffles unit to 1st index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(1)
				})
			})

			describe('when random rolls 0.5', () => {
				mockRandomForEach([0.5])

				it('shuffles unit to 2nd index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(2)
				})
			})

			describe('when random rolls 0.99', () => {
				mockRandomForEach([0.99])

				it('shuffles unit to 3rd index', () => {
					game.player.handle.cardDeck.shuffleUnitIn(targetUnit)
					expect(game.player.handle.cardDeck.allCards.indexOf(targetUnit)).toEqual(3)
				})
			})
		})
	})
})
