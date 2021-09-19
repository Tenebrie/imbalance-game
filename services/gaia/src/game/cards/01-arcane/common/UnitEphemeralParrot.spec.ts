import CardLocation from '@shared/enums/CardLocation'

import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitElemental from '../../11-testing/TestingUnitElemental'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitEphemeralParrot from './UnitEphemeralParrot'

const CardInTesting = UnitEphemeralParrot

describe('UnitEphemeralParrot', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played with an elemental in the deck', () => {
		beforeEach(() => {
			game.player.deck.add(TestingUnitElemental)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('fetches the elemental', () => {
			expect(game.player.find(TestingUnitElemental).location).toEqual(CardLocation.HAND)
		})

		it('does not consume unit mana', () => {
			expect(game.player.getUnitMana()).toEqual(1)
		})
	})

	describe('when played with many cards in the deck', () => {
		beforeEach(() => {
			game.player.deck.add(TestingUnitNoEffect)
			game.player.deck.add(TestingUnitElemental)
			game.player.deck.add(TestingUnitElemental)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('fetches the first elemental', () => {
			expect(game.player.findAt(TestingUnitElemental, 0).location).toEqual(CardLocation.HAND)
		})

		it('does not fetch other cards', () => {
			expect(game.player.find(TestingUnitNoEffect).location).toEqual(CardLocation.DECK)
			expect(game.player.findAt(TestingUnitElemental, 1).location).toEqual(CardLocation.DECK)
		})
	})
})
