import { setupTestGame, TestGame } from '@src/utils/TestGame'

import ServerGame from '../models/ServerGame'
import ServerPlayerGroup from '../players/ServerPlayerGroup'
import TestingRulesetNovel from '../rulesets/testing/TestingRulesetNovel'
import TestingRulesetPVP from '../rulesets/testing/TestingRulesetPVP'
import IncomingMessageHandlers from './IncomingMessageHandlers'

describe('IncomingMessageHandlers', () => {
	let game: TestGame
	const endRoundSpy = jest.spyOn(ServerPlayerGroup.prototype, 'endRound')
	const advanceCurrentTurnSpy = jest.spyOn(ServerGame.prototype, 'advanceCurrentTurn')

	describe('normally', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			jest.clearAllMocks()
		})

		it('player is allowed to end their round', () => {
			IncomingMessageHandlers.genericAction_turnEnd(null, game.handle, game.player.handle)
			expect(endRoundSpy).toHaveBeenCalled()
			expect(advanceCurrentTurnSpy).toHaveBeenCalled()
		})
	})

	describe('when novel mode is active', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetNovel)
			jest.clearAllMocks()
		})

		it('player is blocked from ending the round', () => {
			IncomingMessageHandlers.genericAction_turnEnd(null, game.handle, game.player.handle)
			expect(endRoundSpy).not.toHaveBeenCalled()
			expect(advanceCurrentTurnSpy).not.toHaveBeenCalled()
		})
	})

	describe("during opponent's turn", () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			jest.clearAllMocks()
		})

		it('player is blocked from ending the round', () => {
			IncomingMessageHandlers.genericAction_turnEnd(null, game.handle, game.opponent.handle)
			expect(endRoundSpy).not.toHaveBeenCalled()
			expect(advanceCurrentTurnSpy).not.toHaveBeenCalled()
		})
	})

	describe('when player has ended their round', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			game.player.endRound()
			jest.clearAllMocks()
		})

		it('player is blocked from ending the round', () => {
			IncomingMessageHandlers.genericAction_turnEnd(null, game.handle, game.player.handle)
			expect(endRoundSpy).not.toHaveBeenCalled()
			expect(advanceCurrentTurnSpy).not.toHaveBeenCalled()
		})
	})
})
