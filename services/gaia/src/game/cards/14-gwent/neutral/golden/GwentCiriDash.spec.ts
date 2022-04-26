import CardLocation from '@shared/enums/CardLocation'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentCiriDash from './GwentCiriDash'

const CardInTesting = GwentCiriDash

describe('GwentCiriDash', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('card dies', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting).takeDamage(8999)
		})

		it('returns to deck', () => {
			expect(game.player.find(CardInTesting).location).toEqual(CardLocation.DECK)
		})

		it(`strengthens by ${CardInTesting.BOOST}`, () => {
			expect(game.player.find(CardInTesting).handle.buffs.getIntensity(BuffBaseStrength)).toEqual(CardInTesting.BOOST)
		})
	})

	describe('round ends', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.endRound()
			game.opponent.endRound()
		})

		it('does not return to deck', () => {
			expect(game.player.find(CardInTesting).location).toEqual(CardLocation.GRAVEYARD)
		})

		it(`does not strengthen by ${CardInTesting.BOOST}`, () => {
			expect(game.player.find(CardInTesting).handle.buffs.getIntensity(BuffBaseStrength)).toEqual(0)
		})
	})
})
