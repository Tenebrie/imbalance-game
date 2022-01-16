import { enumToArray } from '../../../../../shared/src/Utils'
import GameCloseReason from '../../enums/GameCloseReason'
import GameVictoryCondition from '../../enums/GameVictoryCondition'
import { setupTestGame, TestGame } from '../../utils/TestGame'
import TestGameTemplates from '../../utils/TestGameTemplates'
import { getClassFromConstructor } from '../../utils/Utils'
import TestingLeader from '../cards/11-testing/TestingLeader'
import TestingLeaderWithPower from '../cards/11-testing/TestingLeaderWithPower'
import TestingUnit100Power from '../cards/11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../cards/11-testing/TestingUnitNoEffect'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import TestingRulesetChain from '../rulesets/testing/TestingRulesetChain'
import TestingRulesetCoop from '../rulesets/testing/TestingRulesetCoop'
import TestingRulesetPVE from '../rulesets/testing/TestingRulesetPVE'
import TestingRulesetPVP from '../rulesets/testing/TestingRulesetPVP'
import ServerGame from './ServerGame'
import ServerGameTimers from './ServerGameTimers'

describe('ServerGame Game finishing', () => {
	let game: TestGame
	const playerFinishSpy = jest.spyOn(ServerGame.prototype, 'playerFinish')
	const systemFinishSpy = jest.spyOn(ServerGame.prototype, 'systemFinish')

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('timeouts', () => {
		beforeEach(() => {
			jest.useFakeTimers()
		})

		afterEach(() => {
			jest.useRealTimers()
		})

		describe('when a player leaves pvp game', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetPVP)
				game.player.leaveGame()
			})

			it('does not destroy the game immediately', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})

			it('destroys the game after the reconnect timeout', () => {
				jest.advanceTimersByTime(ServerGameTimers.PLAYER_RECONNECT_TIMEOUT)
				expect(systemFinishSpy).toHaveBeenCalledWith(game.opponent.handle.group, GameVictoryCondition.PLAYER_CONNECTION_LOST)
			})
		})

		describe('when both players leave pvp game', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetPVP)
				game.player.leaveGame()
				game.opponent.leaveGame()
			})

			it('destroys the game immediately', () => {
				expect(systemFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.ALL_PLAYERS_CONNECTION_LOST)
			})
		})

		describe('when both players leave coop game', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetCoop)
				game.player.leaveGame()
				game.coopPlayer.leaveGame()
			})

			it('does not destroy the game immediately', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})

			it('destroys the game after the reconnect timeout', () => {
				jest.advanceTimersByTime(ServerGameTimers.PLAYER_RECONNECT_TIMEOUT)
				expect(systemFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.PLAYER_CONNECTION_LOST)
			})
		})

		describe('when a player leave coop game', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetCoop)
				game.player.leaveGame()
			})

			it('does not destroy the game immediately', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})

			it('does not destroy the game even after the double reconnect timeout', () => {
				jest.advanceTimersByTime(ServerGameTimers.PLAYER_RECONNECT_TIMEOUT * 2)
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})
		})

		describe('when the player leaves pve game', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetPVE)
				game.player.leaveGame()
			})

			it('does not destroy the game immediately', () => {
				expect(systemFinishSpy).not.toHaveBeenCalled()
			})

			it('destroys the game after the reconnect timeout', () => {
				jest.advanceTimersByTime(ServerGameTimers.PLAYER_RECONNECT_TIMEOUT)
				expect(systemFinishSpy).toHaveBeenCalledWith(null, GameVictoryCondition.PLAYER_CONNECTION_LOST)
			})
		})
	})

	describe('chains', () => {
		afterEach(() => {
			GameLibrary.games.forEach((game) => GameLibrary.destroyGame(game, GameCloseReason.NORMAL_CLEANUP))
		})

		describe('when a pvp game ends', () => {
			beforeEach(() => {
				game = setupTestGame(TestingRulesetPVP)
			})

			it('does not create any chained games', async () => {
				game.handle.systemFinish(null, GameVictoryCondition.UNKNOWN)

				await new Promise(process.nextTick)
				expect(GameLibrary.games.length).toEqual(0)
			})
		})

		describe(`when a chaining game end with a specific victory condition`, () => {
			ServerGame.VALID_CHAIN_VICTORY_CONDITIONS.map((condition) =>
				it(`creates a chained game for '${condition}' condition`, async () => {
					game = setupTestGame(TestingRulesetChain)
					game.handle.systemFinish(null, condition)

					await new Promise(process.nextTick)
					expect(GameLibrary.games.length).toEqual(1)
					expect(GameLibrary.games[0].ruleset.class).toEqual(getClassFromConstructor(TestingRulesetPVP))
				})
			)

			enumToArray(GameVictoryCondition)
				.filter((condition) => !ServerGame.VALID_CHAIN_VICTORY_CONDITIONS.includes(condition))
				.map((condition) =>
					it(`does not create a chained game for '${condition}' condition`, async () => {
						game = setupTestGame(TestingRulesetChain)
						game.handle.systemFinish(null, condition)

						await new Promise(process.nextTick)
						expect(GameLibrary.games.length).toEqual(0)
					})
				)
		})
	})

	describe('victory conditions', () => {
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
