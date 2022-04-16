import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentBarbegazi from './GwentBarbegazi'

const CardInTesting = GwentBarbegazi

describe('GwentBarbegazi', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('in hand', () => {
		beforeEach(() => {
			game.player.add(CardInTesting)
		})

		it('has resilience feature', () => {
			expect(game.player.find(CardInTesting).handle.features.includes(CardFeature.RESILIENCE)).toEqual(true)
		})
	})

	describe('on board', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('has resilience feature', () => {
			expect(game.board.find(CardInTesting).handle.features.includes(CardFeature.RESILIENCE)).toEqual(true)
		})
	})

	describe('after round end', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
			game.opponent.endRound()
			game.player.endRound()
		})

		it('stays on the board', () => {
			expect(() => game.board.find(CardInTesting)).not.toThrow()
		})

		it('does not have resilience feature', () => {
			expect(game.board.find(CardInTesting).handle.features.includes(CardFeature.RESILIENCE)).toEqual(false)
		})
	})

	describe('after another round end', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
			game.opponent.endRound()
			game.player.endRound()
			game.opponent.summon(TestingUnit100Power)
			game.player.endRound()
			game.opponent.endRound()
		})

		it('does not stay on the board', () => {
			expect(() => game.board.find(CardInTesting)).toThrow()
		})

		it('moves to the graveyard', () => {
			expect(() => game.player.findIn(CardInTesting, CardLocation.GRAVEYARD)).not.toThrow()
		})

		it('has resilience feature', () => {
			expect(game.player.find(CardInTesting).handle.features.includes(CardFeature.RESILIENCE)).toEqual(true)
		})
	})

	describe('if returned to hand after round end', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
			game.opponent.endRound()
			game.player.endRound()
			game.board.find(CardInTesting).returnToHand()
		})

		it('has resilience feature', () => {
			expect(game.player.find(CardInTesting).handle.features.includes(CardFeature.RESILIENCE)).toEqual(true)
		})
	})
})
