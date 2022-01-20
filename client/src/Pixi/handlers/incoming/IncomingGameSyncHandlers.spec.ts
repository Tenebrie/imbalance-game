import GameStartMessage from '@shared/models/network/GameStartMessage'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import { RulesetObjective } from '@shared/models/ruleset/RulesetObjectiveLocalization'

import { setupTestGame, TestGame } from '@/jest/setupTestGame'
import store from '@/Vue/store/GameObjectiveStore'

describe('IncomingGameSyncHandlers', () => {
	let game: TestGame

	beforeEach(async () => {
		game = await setupTestGame()
		jest.useFakeTimers()
	})

	describe('GameSyncMessageType.START', () => {
		describe(`when objective is received`, () => {
			const objective: RulesetObjective = {
				en: {
					title: 'Test title',
					description: 'Test description',
				},
			}

			beforeEach(() => {
				game.receive({
					type: GameSyncMessageType.START,
					data: new GameStartMessage(objective, false),
				})
			})

			it('sets the game objective', () => {
				expect(store.state.objective).toEqual(objective)
			})

			it('does not display it immediately', () => {
				expect(store.state.popupVisible).toEqual(false)
			})

			it('displays it after delay', () => {
				jest.advanceTimersByTime(1000)
				expect(store.state.popupVisible).toEqual(true)
			})
		})

		describe(`when objective is null`, () => {
			beforeEach(() => {
				game.receive({
					type: GameSyncMessageType.START,
					data: new GameStartMessage(null, false),
				})
			})

			it('sets the game objective', () => {
				expect(store.state.objective).toEqual(null)
			})

			it('does not display it immediately', () => {
				expect(store.state.popupVisible).toEqual(false)
			})

			it('does not display it after delay', () => {
				jest.advanceTimersByTime(1000)
				expect(store.state.popupVisible).toEqual(false)
			})
		})
	})
})
