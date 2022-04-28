import { WebMessageType } from '@shared/models/network/messageHandlers/WebMessageTypes'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import ServerPlayer from '@src/game/players/ServerPlayer'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import TestingRulesetGwentAI from '@src/game/rulesets/testing/TestingRulesetGwentAI'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentImlerithSabbath from './GwentImlerithSabbath'

const CardInTesting = GwentImlerithSabbath

describe('GwentImlerithSabbath', () => {
	let game: TestGame
	let imlerithBasePower: number
	const errorSpy = jest.spyOn(ServerPlayer.prototype, 'sendGlobalMessage')

	beforeAll(() => {
		jest.useFakeTimers()
		game = setupTestGame(TestingRulesetGwent)
		imlerithBasePower = game.player.add(CardInTesting).stats.basePower
	})

	beforeEach(() => {
		errorSpy.mockClear()
	})

	describe('against a player', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetGwent)
		})

		describe('with no enemies', () => {
			beforeEach(() => {
				game.player.add(CardInTesting).play()
			})

			it('does nothing', () => {
				expect(() => game.board.find(CardInTesting)).not.toThrow()
			})

			it('does not send errors', () => {
				expect(errorSpy.mock.calls.filter((call) => call[0].type === WebMessageType.IN_GAME_ERROR).length).toEqual(0)
			})
		})

		describe('with an enemy present', () => {
			beforeEach(() => {
				game.opponent.summon(TestingUnit100Power)
				game.player.add(CardInTesting).play()
			})

			it('deals damage to the enemy', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100 - imlerithBasePower)
			})

			it('gets destroyed', () => {
				expect(() => game.board.find(CardInTesting)).toThrow()
			})

			it('does not send errors', () => {
				expect(errorSpy.mock.calls.filter((call) => call[0].type === WebMessageType.IN_GAME_ERROR).length).toEqual(0)
			})
		})
	})

	describe('against AI', () => {
		beforeEach(() => {
			game = setupTestGame(TestingRulesetGwentAI)
		})

		describe('with AI playing a card after Imlerith', () => {
			beforeEach(() => {
				game.opponent.add(TestingUnit100Power)
				game.player.add(CardInTesting).play()
			})

			it('is not dead', () => {
				expect(() => game.board.find(CardInTesting)).not.toThrow()
			})

			it('does not deal damage', () => {
				expect(game.board.find(TestingUnit100Power).stats.power).toEqual(100)
			})

			it('does not send errors', () => {
				expect(errorSpy.mock.calls.filter((call) => call[0].type === WebMessageType.IN_GAME_ERROR).length).toEqual(0)
			})
		})
	})
})
