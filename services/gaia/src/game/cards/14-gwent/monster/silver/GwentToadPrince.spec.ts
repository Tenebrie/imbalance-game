import CardLocation from '@shared/enums/CardLocation'
import TestingSpell10Mana from '@src/game/cards/11-testing/TestingSpell10Mana'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentToadPrince from './GwentToadPrince'

const CardInTesting = GwentToadPrince

describe('GwentToadPrince', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('with no cards in hand', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('with no units in hand', () => {
		beforeEach(() => {
			game.player.add(TestingSpell10Mana)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('with an ally on board', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('with a unit in deck', () => {
		beforeEach(() => {
			game.player.deck.add(TestingUnit100Power)
			game.player.add(CardInTesting).play()
		})

		it('does not resolve the card', () => {
			expect(game.stack.countAll()).toEqual(1)
		})

		it('draws the unit from the deck', () => {
			expect(() => game.player.findIn(TestingUnit100Power, CardLocation.HAND)).not.toThrow()
		})
	})

	describe('after targeting unit in hand', () => {
		beforeEach(() => {
			game.player.deck.add(TestingUnit100Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gains extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + 100)
		})

		it('moves the unit to graveyard', () => {
			expect(() => game.player.findIn(TestingUnit100Power, CardLocation.GRAVEYARD)).not.toThrow()
		})
	})
})
