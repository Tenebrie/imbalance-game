import LeaderStatType from '../../../../../../shared/src/enums/LeaderStatType'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffProtector from '../../../buffs/BuffProtector'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitVoidGuardian from './UnitVoidGuardian'

describe('UnitVoidGuardian', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when in hand', () => {
		beforeEach(() => {
			game.player.add(UnitVoidGuardian)
		})

		it('has protector buff', () => {
			expect(game.player.find(UnitVoidGuardian).buffs.has(BuffProtector)).toBeTruthy()
		})
	})

	describe('when played', () => {
		beforeEach(() => {
			game.player.add(UnitVoidGuardian).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('has protector buff', () => {
			expect(game.player.find(UnitVoidGuardian).buffs.has(BuffProtector)).toBeTruthy()
		})

		it('provides recurring summon count', () => {
			expect(game.player.getLeaderStat(LeaderStatType.RECURRING_SUMMON_COUNT)).toEqual(1)
		})
	})
})
