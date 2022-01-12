import GameVictoryCondition from '../../enums/GameVictoryCondition'
import { setupTestGame, TestGame } from '../../utils/TestGame'
import TestGameTemplates from '../../utils/TestGameTemplates'
import TestingLeader from '../cards/11-testing/TestingLeader'
import TestingLeaderWithPower from '../cards/11-testing/TestingLeaderWithPower'
import TestingUnit100Power from '../cards/11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../cards/11-testing/TestingUnitNoEffect'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import TestingRulesetPVE from '../rulesets/testing/TestingRulesetPVE'
import TestingRulesetPVP from '../rulesets/testing/TestingRulesetPVP'
import ServerGame from './ServerGame'

describe('ServerGame Game finishing', () => {
	let game: TestGame
	const playerFinishSpy = jest.spyOn(ServerGame.prototype, 'playerFinish')
	const systemFinishSpy = jest.spyOn(ServerGame.prototype, 'systemFinish')

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('when pvp game ends with a first player victory', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			game.player.summon(TestingUnit100Power)
			game.player.endRound()
			game.opponent.endRound()
			game.player.endRound()
			game.opponent.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(game.player.handle.group, GameVictoryCondition.STANDARD_PVP)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(game.player.handle.group, GameVictoryCondition.STANDARD_PVP, expect.anything())
		})
	})

	describe('when pvp game ends with a second player victory', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			game.opponent.summon(TestingUnit100Power)
			game.player.endRound()
			game.opponent.endRound()
			game.opponent.endRound()
			game.player.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.STANDARD_PVP)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.STANDARD_PVP, expect.anything())
		})
	})

	describe('when pvp game ends with a draw', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			game.player.endRound()
			game.opponent.endRound()
			game.player.endRound()
			game.opponent.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.STANDARD_DRAW)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.STANDARD_DRAW, expect.anything())
		})
	})

	describe('when pve game ends with a player win', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVE)
			game.player.summon(TestingUnit100Power)
			game.player.endRound()
			game.player.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(game.player.handle.group, GameVictoryCondition.AI_GAME_WIN)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(game.player.handle.group, GameVictoryCondition.AI_GAME_WIN, expect.anything())
		})
	})

	describe('when pve game ends with an AI win', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVE)
			game.opponent.summon(TestingUnit100Power)
			game.player.endRound()
			game.player.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.AI_GAME_LOSE)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.AI_GAME_LOSE, expect.anything())
		})
	})

	describe('when pve game ends with a draw', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVE)
			game.player.endRound()
			game.player.endRound()
		})

		it('marks the game as finished', () => {
			expect(game.result.isFinished()).toBeTruthy()
		})

		it('calls playerFinish with correct args', () => {
			expect(playerFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.STANDARD_DRAW)
		})

		it('calls systemFinish with correct args', () => {
			expect(systemFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.STANDARD_DRAW, expect.anything())
		})
	})

	describe('when gameFinished hook is present', () => {
		let ruleset: TestingRulesetPVP

		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVP)
			ruleset = game.handle.ruleset as TestingRulesetPVP
			game.finishCurrentRound()
		})

		describe('when finishPrevented is false', () => {
			beforeEach(() => {
				ruleset.setGameFinishedHookParams({
					finishPrevented: false,
				})
				game.finishCurrentRound()
			})

			it('does call systemFinish', () => {
				expect(systemFinishSpy).toHaveBeenCalled()
			})
		})

		describe('when finishPrevented is true', () => {
			beforeEach(() => {
				ruleset.setGameFinishedHookParams({
					finishPrevented: true,
				})
				game.finishCurrentRound()
			})

			it('does not call systemFinish', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})
		})

		describe('when many params are provided', () => {
			beforeEach(() => {
				ruleset.setGameFinishedHookParams({
					victoryCondition: GameVictoryCondition.STORY_TRIGGER,
					chainImmediately: true,
					victoriousPlayer: game.opponent.handle.group,
				})
				game.finishCurrentRound()
			})

			it('proxies parameters to systemFinish', () => {
				expect(systemFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.STORY_TRIGGER, true)
			})
		})
	})

	describe('after the game has ended', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVE)
			game.player.endRound()
			game.player.endRound()
		})

		describe('and playerFinish is called again', () => {
			beforeEach(() => {
				systemFinishSpy.mockReset()
				game.handle.playerFinish(null, GameVictoryCondition.UNKNOWN)
			})

			it('ignores the call', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})
		})
	})
})

describe('ServerGame Legacy', () => {
	let game: ServerGame
	let player: ServerPlayerInGame
	let startNextRound: () => void

	beforeEach(() => {
		;({ game, player, startNextRound } = TestGameTemplates.normalGameFlow())
	})

	describe('player move order', () => {
		describe('normal order', () => {
			beforeEach(() => {
				;({ game, startNextRound } = TestGameTemplates.normalGameFlow({
					playerMoveOrderReversed: false,
				}))
			})

			it("starts player 0's move first at the beginning", () => {
				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 0's move first after draw", () => {
				startNextRound()

				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 0's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), player, 5, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 1's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), player, 0, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeTruthy()
				expect(game.players[1].turnEnded).toBeFalsy()
			})
		})

		describe('reversed order', () => {
			beforeEach(() => {
				;({ game, startNextRound } = TestGameTemplates.normalGameFlow({
					playerMoveOrderReversed: true,
				}))
			})

			it("starts player 1's move first at the beginning", () => {
				expect(game.players[0].turnEnded).toBeTruthy()
				expect(game.players[1].turnEnded).toBeFalsy()
			})

			it("starts player 1's move first after draw", () => {
				startNextRound()

				expect(game.players[0].turnEnded).toBeTruthy()
				expect(game.players[1].turnEnded).toBeFalsy()
			})

			it("starts player 0's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), player, 5, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 1's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), player, 0, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeTruthy()
				expect(game.players[1].turnEnded).toBeFalsy()
			})
		})

		describe('includes leader power into power calculation', () => {
			it('gives victory to player with stronger leader', () => {
				;({ game, startNextRound } = TestGameTemplates.leaderTest(TestingLeaderWithPower, TestingLeader))
				const spy = jest.spyOn(ServerGame.prototype, 'playerFinish')
				startNextRound()
				startNextRound()
				expect(spy).toHaveBeenCalledWith(game.players[0], GameVictoryCondition.STANDARD_PVP)
			})

			it('gives victory to player with stronger leader with players reversed', () => {
				;({ game, startNextRound } = TestGameTemplates.leaderTest(TestingLeader, TestingLeaderWithPower))
				const spy = jest.spyOn(ServerGame.prototype, 'playerFinish')
				startNextRound()
				startNextRound()
				expect(spy).toHaveBeenCalledWith(game.players[1], GameVictoryCondition.STANDARD_PVP)
			})
		})
	})
})
