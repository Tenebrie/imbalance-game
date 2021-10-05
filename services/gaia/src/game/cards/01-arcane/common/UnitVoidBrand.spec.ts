import CardTribe from '@shared/enums/CardTribe'

import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit5PowerVoidspawn from '../../11-testing/TestingUnit5PowerVoidspawn'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitVoidBrand from './UnitVoidBrand'

const CardInTesting = UnitVoidBrand

describe('UnitVoidBrand', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when a card is in hand', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.add(CardInTesting)
		})

		it('does not give the target extra power', () => {
			const card = game.board.find(TestingUnit5PowerVoidspawn)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when a normal ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives the target voidspawn tribe', () => {
			expect(game.board.find(TestingUnitNoEffect).tribes.includes(CardTribe.VOIDSPAWN)).toBeTruthy()
		})

		it('gives the target extra power', () => {
			const card = game.board.find(TestingUnitNoEffect)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitVoidBrand.EXTRA_POWER)
		})
	})

	describe('when a voidspawn ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives the target extra power', () => {
			const card = game.board.find(TestingUnit5PowerVoidspawn)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitVoidBrand.EXTRA_POWER)
		})
	})

	describe('when many void brands are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
			game.player.summon(CardInTesting)
		})

		it('gives the target extra power', () => {
			const card = game.board.find(TestingUnit5PowerVoidspawn)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitVoidBrand.EXTRA_POWER * 3)
		})
	})

	describe('when deselecting transformed minion', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(CardInTesting)
		})

		it('handles it gracefully', () => {
			const voidspawn = game.board.find(TestingUnit5PowerVoidspawn)
			expect(() => voidspawn.transformInto(TestingUnitNoEffect)).not.toThrow()
		})
	})

	describe('when the only target is an enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not give voidspawn tribe', () => {
			expect(game.board.find(TestingUnitNoEffect).tribes.includes(CardTribe.VOIDSPAWN)).toBeFalsy()
		})

		it('does not give extra power', () => {
			const card = game.board.find(TestingUnitNoEffect)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when the only target is a voidspawn enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit5PowerVoidspawn)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not give extra power', () => {
			const card = game.board.find(TestingUnit5PowerVoidspawn)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})
})
