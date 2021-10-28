import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit1RecurringSummonCount from '../../11-testing/TestingUnit1RecurringSummonCount'
import UnitShadow from './UnitShadow'
import UnitVoidPortal from './UnitVoidPortal'

const CardInTesting = UnitVoidPortal

describe('UnitVoidPortal', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on turn end', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.endTurn()
		})

		it('summons the shadow', () => {
			expect(game.board.count(UnitShadow)).toEqual(UnitVoidPortal.BASE_SHADOWS_SUMMONED)
		})
	})

	describe('on turn end when recurring summon count is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit1RecurringSummonCount)
			game.player.summon(CardInTesting)
			game.player.endTurn()
		})

		it('summons an extra shadow', () => {
			expect(game.board.count(UnitShadow)).toEqual(UnitVoidPortal.BASE_SHADOWS_SUMMONED + 1)
		})
	})

	describe('on opponents turn end', () => {
		beforeEach(() => {
			game.player.endTurn()
			game.player.summon(CardInTesting)
			game.opponent.endTurn()
		})

		it('does not summon a shadow', () => {
			expect(game.board.count(UnitShadow)).toEqual(0)
		})
	})

	describe('on turn end when row is full', () => {
		beforeEach(() => {
			game.player.fillRow(CardInTesting)
			game.player.endTurn()
		})

		it('does not summon a shadow', () => {
			expect(game.board.count(UnitShadow)).toEqual(0)
		})
	})
})
