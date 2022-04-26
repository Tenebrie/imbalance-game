import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import TestingUnit2Power from '@src/game/cards/11-testing/TestingUnit2Power'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '@src/game/cards/11-testing/TestingUnitNoEffect'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentWildHuntWarrior from './GwentWildHuntWarrior'

const CardInTesting = GwentWildHuntWarrior

describe('GwentWildHuntWarrior', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('on an empty board', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('with an ally', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('with a strong enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('deals damage to the enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentWildHuntWarrior.DAMAGE)
		})

		it('does not boost self', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
			expect(card.buffs.count()).toEqual(0)
		})
	})

	describe('with a weak enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit2Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('kills the enemy', () => {
			expect(() => game.board.find(TestingUnit2Power)).toThrow()
		})

		it('boosts self', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + GwentWildHuntWarrior.SELF_BOOST)
		})
	})

	describe('with a strong enemy under frost', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power).getRow().buffs.add(BuffGwentRowFrost)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('deals damage to the enemy', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - GwentWildHuntWarrior.DAMAGE - BuffGwentRowFrost.DAMAGE)
		})

		it('boosts self', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + GwentWildHuntWarrior.SELF_BOOST)
		})
	})
})
