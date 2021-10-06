import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitHandOfAreddon from './UnitHandOfAreddon'

const CardInTesting = UnitHandOfAreddon

describe('UnitHandOfAreddon', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when no allies are present', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not modify the card power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when an ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('adds extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + 100)
		})

		it('destroys the ally', () => {
			expect(game.board.count(TestingUnit100Power)).toEqual(0)
		})
	})

	describe('when five allies are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).playTo('front', 3)
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('adds extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + 400)
		})

		it('destroys adjacent allies', () => {
			expect(game.board.count(TestingUnit100Power)).toEqual(0)
		})

		it('does not destroy the third ally', () => {
			expect(game.board.count(TestingUnitNoEffect)).toEqual(1)
		})
	})
})
