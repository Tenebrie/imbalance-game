import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentWildHuntRider from './GwentWildHuntRider'

const CardInTesting = GwentWildHuntRider

describe('GwentWildHuntRider', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('when biting frost triggers on the opposite row', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.opponent.getFrontRow().buffs.add(BuffGwentRowFrost)
			game.opponent.summon(TestingUnit100Power)
			game.player.endTurn()
		})

		it('deals extra damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - BuffGwentRowFrost.DAMAGE - GwentWildHuntRider.EXTRA_DAMAGE)
		})
	})

	describe('when biting frost triggers on the opposite row with multiple riders', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
			game.opponent.getFrontRow().buffs.add(BuffGwentRowFrost)
			game.opponent.summon(TestingUnit100Power)
			game.player.endTurn()
		})

		it('deals extra damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - BuffGwentRowFrost.DAMAGE - GwentWildHuntRider.EXTRA_DAMAGE * 5)
		})
	})

	describe('when biting frost triggers on the different row', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting, 'back')
			game.opponent.getFrontRow().buffs.add(BuffGwentRowFrost)
			game.opponent.summon(TestingUnit100Power)
			game.player.endTurn()
		})

		it('deals base damage', () => {
			expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - BuffGwentRowFrost.DAMAGE)
		})
	})

	describe('when biting frost triggers on the same row', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.getFrontRow().buffs.add(BuffGwentRowFrost)
			game.player.endTurn()
			game.opponent.endTurn()
		})

		it('deals base damage', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower - BuffGwentRowFrost.DAMAGE)
		})
	})
})
