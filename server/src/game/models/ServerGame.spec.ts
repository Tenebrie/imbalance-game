import ServerGame from './ServerGame'
import TestGameTemplates from '../../utils/TestGameTemplates'
import TestingUnitNoEffect from '../cards/11-testing/TestingUnitNoEffect'
import TestingLeaderWithPower from '../cards/11-testing/TestingLeaderWithPower'
import TestingLeader from '../cards/11-testing/TestingLeader'

describe('ServerGameEvents', () => {
	let game: ServerGame
	let startNextRound: () => void

	beforeEach(() => {
		;({ game, startNextRound } = TestGameTemplates.normalGameFlow())
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
				game.board.createUnit(new TestingUnitNoEffect(game), 5, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 1's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), 0, 0)
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
				game.board.createUnit(new TestingUnitNoEffect(game), 5, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeFalsy()
				expect(game.players[1].turnEnded).toBeTruthy()
			})

			it("starts player 1's move first if they win", () => {
				game.board.createUnit(new TestingUnitNoEffect(game), 0, 0)
				startNextRound()

				expect(game.players[0].turnEnded).toBeTruthy()
				expect(game.players[1].turnEnded).toBeFalsy()
			})
		})

		describe('includes leader power into power calculation', () => {
			it('gives victory to player with stronger leader', () => {
				;({ game, startNextRound } = TestGameTemplates.leaderTest(TestingLeaderWithPower, TestingLeader))
				const spy = jest.spyOn(ServerGame.prototype, 'finish')
				startNextRound()
				startNextRound()
				expect(spy).toHaveBeenCalledWith(game.players[0], 'PvP win condition')
			})

			it('gives victory to player with stronger leader with players reversed', () => {
				;({ game, startNextRound } = TestGameTemplates.leaderTest(TestingLeader, TestingLeaderWithPower))
				const spy = jest.spyOn(ServerGame.prototype, 'finish')
				startNextRound()
				startNextRound()
				expect(spy).toHaveBeenCalledWith(game.players[1], 'PvP win condition')
			})
		})
	})
})
