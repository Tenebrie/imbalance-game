import CardLocation from '@shared/enums/CardLocation'
import TestingUnit2Power from '@src/game/cards/11-testing/TestingUnit2Power'
import TestingUnit6Power from '@src/game/cards/11-testing/TestingUnit6Power'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '@src/game/cards/11-testing/TestingUnitNoEffect'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentIceTroll from './GwentIceTroll'

const CardInTesting = GwentIceTroll

describe('GwentIceTroll', () => {
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

	describe('with a oneshottable enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit2Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('kills the enemy', () => {
			expect(() => game.board.find(TestingUnit2Power)).toThrow()
		})

		it('does not take damage', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('with a killable enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit6Power)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('kills the enemy', () => {
			expect(() => game.board.find(TestingUnit6Power)).toThrow()
		})

		it('takes damage', () => {
			const card = game.board.find(CardInTesting)
			expect(card.stats.power).toEqual(2 * card.stats.basePower - 6)
		})
	})

	describe('with an unkillable enemy', () => {
		let trollBasePower: number

		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			const troll = game.player.add(CardInTesting)
			trollBasePower = troll.stats.basePower
			troll.play().targetFirst()
		})

		it('does not kill the enemy', () => {
			expect(() => game.board.find(TestingUnit100Power)).not.toThrow()
		})

		it('deals damage', () => {
			const card = game.board.find(TestingUnit100Power)
			expect(card.stats.power).toEqual(100 - trollBasePower)
		})

		it('gets killed in retaliation', () => {
			expect(() => game.board.find(CardInTesting)).toThrow()
		})

		it('is marked as dead', () => {
			expect(game.player.findIn(CardInTesting, CardLocation.GRAVEYARD).handle.isDead).toEqual(true)
		})

		it('is moved to the graveyard', () => {
			expect(() => game.player.findIn(CardInTesting, CardLocation.GRAVEYARD)).not.toThrow()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})
})
