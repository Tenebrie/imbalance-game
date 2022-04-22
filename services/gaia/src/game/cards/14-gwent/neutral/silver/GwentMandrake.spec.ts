import TestingUnit2Power from '@src/game/cards/11-testing/TestingUnit2Power'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import CardLibrary from '@src/game/libraries/CardLibrary'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentMandrake from './GwentMandrake'
import GwentMandrakeStrengthen from './GwentMandrakeStrengthen'
import GwentMandrakeWeaken from './GwentMandrakeWeaken'

describe('GwentMandrake', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
		CardLibrary.forceLoadCards([GwentMandrakeStrengthen, GwentMandrakeWeaken])
	})

	describe('base effect', () => {
		describe('can choose damaging option', () => {
			beforeEach(() => {
				game.player.summon(TestingUnit100Power)
				game.player.add(GwentMandrake).play().targetFirst().targetFirst()
			})

			it('deals damage', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentMandrakeWeaken.WEAKEN)
			})
		})

		describe('can choose damaging option', () => {
			beforeEach(() => {
				game.player.summon(TestingUnit100Power)
				game.player.add(GwentMandrake).play().targetLast().targetFirst()
			})

			it('strengthens the target', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 + GwentMandrakeStrengthen.EXTRA_POWER)
			})
		})
	})

	describe('strengthening effect', () => {
		describe('when the target was damaged before', () => {
			beforeEach(() => {
				game.opponent.summon(TestingUnit100Power).takeDamage(99)
				game.player.add(GwentMandrakeStrengthen).play().targetFirst()
			})

			it('resolves the card', () => {
				expect(game.stack.countAll()).toEqual(0)
			})

			it('adds base power', () => {
				expect(game.board.find(TestingUnit100Power).stats.basePower).toEqual(100 + GwentMandrakeStrengthen.EXTRA_POWER)
			})

			it('resets the target and adds current power', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 + GwentMandrakeStrengthen.EXTRA_POWER)
			})
		})
	})

	describe('weakening effect', () => {
		describe('when the target would go to 0 power', () => {
			beforeEach(() => {
				game.opponent.summon(TestingUnit2Power)
				game.player.add(GwentMandrakeWeaken).play().targetFirst()
			})

			it('resolves the card', () => {
				expect(game.stack.countAll()).toEqual(0)
			})

			it('destroys the target', () => {
				expect(() => game.board.find(TestingUnit2Power)).toThrow()
			})
		})

		describe('when the target would survive', () => {
			beforeEach(() => {
				game.opponent.summon(TestingUnit100Power)
				game.player.add(GwentMandrakeWeaken).play().targetFirst()
			})

			it('resolves the card', () => {
				expect(game.stack.countAll()).toEqual(0)
			})

			it('damages the target', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentMandrakeWeaken.WEAKEN)
			})
		})

		describe('when the target was damaged before', () => {
			beforeEach(() => {
				game.opponent.summon(TestingUnit100Power).takeDamage(99)
				game.player.add(GwentMandrakeWeaken).play().targetFirst()
			})

			it('resolves the card', () => {
				expect(game.stack.countAll()).toEqual(0)
			})

			it('resets the target before dealing damage', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentMandrakeWeaken.WEAKEN)
			})
		})
	})
})
