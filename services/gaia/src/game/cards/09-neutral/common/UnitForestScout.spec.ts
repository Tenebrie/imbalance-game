import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffStrength from '../../../buffs/BuffStrength'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit0PowerVoidspawn from '../../11-testing/TestingUnit0PowerVoidspawn'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import UnitForestScout from './UnitForestScout'

const CardInTesting = UnitForestScout

describe('UnitForestScout', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on an empty board', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not gain extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when an enemy is present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit0PowerVoidspawn)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('when losing on the board', () => {
		beforeEach(() => {
			const card = game.player.add(CardInTesting)
			game.opponent.summon(TestingUnit0PowerVoidspawn).buffs.addMultiple(BuffStrength, card.stats.power + 1)
			card.play()
		})

		it('gains extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitForestScout.BOARD_POWER_BONUS_BASE)
		})
	})

	describe('when equal on the board', () => {
		beforeEach(() => {
			const card = game.player.add(CardInTesting)
			game.opponent.summon(TestingUnit0PowerVoidspawn).buffs.addMultiple(BuffStrength, card.stats.power)
			card.play()
		})

		it('does not gain extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when winning on the board', () => {
		beforeEach(() => {
			const card = game.player.add(CardInTesting)
			game.opponent.summon(TestingUnit0PowerVoidspawn).buffs.addMultiple(BuffStrength, card.stats.power - 1)
			card.play()
		})

		it('does not gain extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when losing on rounds', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.startNextRound()

			game.opponent.endTurn()
			game.player.add(CardInTesting).play()
		})

		it('gains extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitForestScout.BOARD_POWER_BONUS_BASE)
		})
	})

	describe('when winning on rounds', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.startNextRound()
			game.player.add(CardInTesting).play()
		})

		it('does not gain extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('when losing on rounds and board', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.startNextRound()
			game.opponent.endTurn()

			const card = game.player.add(CardInTesting)
			game.opponent.summon(TestingUnit0PowerVoidspawn).buffs.addMultiple(BuffStrength, card.stats.power + 1)
			card.play()
		})

		it('gains extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(
				card.stats.basePower + UnitForestScout.BOARD_POWER_BONUS_BASE + UnitForestScout.ROUND_POWER_BONUS_BASE
			)
		})
	})
})
