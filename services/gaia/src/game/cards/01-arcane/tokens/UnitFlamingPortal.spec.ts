import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit1RecurringSummonCount from '../../11-testing/TestingUnit1RecurringSummonCount'
import UnitFlamingPortal from './UnitFlamingPortal'
import UnitFlamingShadow from './UnitFlamingShadow'

const CardInTesting = UnitFlamingPortal

describe('UnitFlamingPortal', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on turn end', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.advanceTurn()
		})

		it('summons the shadow', () => {
			expect(game.board.count(UnitFlamingShadow)).toEqual(UnitFlamingPortal.BASE_SHADOWS_SUMMONED)
		})
	})

	describe('on turn end when recurring summon count is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit1RecurringSummonCount)
			game.player.summon(CardInTesting)
			game.advanceTurn()
		})

		it('summons an extra shadow', () => {
			expect(game.board.count(UnitFlamingShadow)).toEqual(UnitFlamingPortal.BASE_SHADOWS_SUMMONED + 1)
		})
	})

	describe('on opponents turn end', () => {
		beforeEach(() => {
			game.advanceTurn()
			game.player.summon(CardInTesting)
			game.advanceTurn()
		})

		it('does not summon a shadow', () => {
			expect(game.board.count(UnitFlamingShadow)).toEqual(0)
		})
	})

	describe('on turn end when row is full', () => {
		beforeEach(() => {
			game.player.fillRow(CardInTesting)
			game.advanceTurn()
		})

		it('does not summon a shadow', () => {
			expect(game.board.count(UnitFlamingShadow)).toEqual(0)
		})
	})
})
