import LeaderStatType from '../../../../../../shared/src/enums/LeaderStatType'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import BuffProtector from '../../../buffs/BuffProtector'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitGatewayGuardian from './UnitGatewayGuardian'

describe('UnitGatewayGuardian', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when in hand', () => {
		beforeEach(() => {
			game.player.add(UnitGatewayGuardian)
		})

		it('has protector buff', () => {
			expect(game.player.find(UnitGatewayGuardian).buffs.has(BuffProtector)).toBeTruthy()
		})
	})

	describe('when played', () => {
		beforeEach(() => {
			game.player.add(UnitGatewayGuardian).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('has protector buff', () => {
			expect(game.player.find(UnitGatewayGuardian).buffs.has(BuffProtector)).toBeTruthy()
		})

		it('provides recurring summon count', () => {
			expect(game.player.getLeaderStat(LeaderStatType.RECURRING_SUMMON_COUNT)).toEqual(1)
		})
	})
})
