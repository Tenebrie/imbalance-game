import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitSinglePower from '../../11-testing/TestingUnitSinglePower'
import UnitAulerianSongwriter from './UnitAulerianSongwriter'

const cardInTesting = UnitAulerianSongwriter

describe('UnitAulerianSongwriter', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when no other units are present', () => {
		beforeEach(() => {
			game.player.add(cardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('creates the unit', () => {
			expect(game.board.count(cardInTesting)).toEqual(1)
		})
	})

	describe('when an ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitSinglePower)
			game.player.add(cardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives the ally extra power', () => {
			expect(game.board.find(TestingUnitSinglePower).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
		})

		describe('next turn', () => {
			beforeEach(() => {
				game.opponent.endTurn()
			})

			it('does not give extra power', () => {
				expect(game.board.find(TestingUnitSinglePower).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			})
		})
	})

	describe('when an enemy is present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitSinglePower)
			game.player.add(cardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives the enemy extra power', () => {
			expect(game.board.find(TestingUnitSinglePower).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
		})
	})

	describe('when many targets are present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitSinglePower)
			game.player.add(TestingUnitSinglePower)
			game.player.deck.add(TestingUnitSinglePower)
			game.player.graveyard.add(TestingUnitSinglePower)
			game.opponent.summon(TestingUnitSinglePower)
			game.opponent.add(TestingUnitSinglePower)
			game.opponent.deck.add(TestingUnitSinglePower)
			game.opponent.graveyard.add(TestingUnitSinglePower)
			game.player.add(cardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives all copies of a card extra power', () => {
			expect(game.player.findAt(TestingUnitSinglePower, 0).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.player.findAt(TestingUnitSinglePower, 1).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.player.findAt(TestingUnitSinglePower, 2).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.player.findAt(TestingUnitSinglePower, 3).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.opponent.findAt(TestingUnitSinglePower, 0).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.opponent.findAt(TestingUnitSinglePower, 1).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.opponent.findAt(TestingUnitSinglePower, 2).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
			expect(game.opponent.findAt(TestingUnitSinglePower, 3).stats.power).toEqual(1 + UnitAulerianSongwriter.BONUS_POWER)
		})
	})
})
