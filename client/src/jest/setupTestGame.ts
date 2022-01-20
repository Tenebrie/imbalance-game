import AccessLevel from '@shared/enums/AccessLevel'
import BoardSplitMode from '@shared/enums/BoardSplitMode'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import GameMessage from '@shared/models/network/GameMessage'
import { ServerToClientGameMessage } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import WS from 'jest-websocket-mock'

import Core from '@/Pixi/Core'
import store from '@/Vue/store'

export type TestGame = {
	receive: (message: ServerToClientGameMessage) => void
	runQueue: () => void
	addToQueue: (message: ServerToClientGameMessage) => void
	teardown: () => void
}

const server = new WS('ws://localhost/api/game/test-game-id?deckId=test-deck-id&groupId=g1')

export const setupTestGame = async (): Promise<TestGame> => {
	store.commit.setPlayerData({
		id: 'test-player-id',
		email: 'admin@localhost',
		username: 'Tester',
		accessLevel: AccessLevel.NORMAL,
		isGuest: false,
	})

	Core.init(
		new GameMessage({
			id: 'test-game-id',
			name: 'Test game',
			isStarted: false,
			isSpectatable: false,
			players: [
				{
					id: 'g1',
					username: '[g1]',
					roundWins: 0,
					openHumanSlots: 1,
					openBotSlots: 0,
					players: [],
				},
				{
					id: 'g2',
					username: '[g2]',
					roundWins: 0,
					openHumanSlots: 0,
					openBotSlots: 0,
					players: [],
				},
			],
			owner: undefined,
			ruleset: {
				class: 'test-ruleset',
				gameMode: GameMode.PVP,
				category: RulesetCategory.PVP,
				sortPriority: 0,
				playerDeckRequired: false,
				slots: {
					groups: [
						{
							players: [
								{
									type: 'player',
								},
							],
						},
						{
							players: [
								{
									type: 'player',
								},
							],
						},
					],
				},
				constants: {
					ROUND_WINS_REQUIRED: 3,
					UNIT_HAND_SIZE_LIMIT: 10,
					UNIT_HAND_SIZE_STARTING: 10,
					UNIT_HAND_SIZE_PER_ROUND: 10,
					SPELL_HAND_SIZE_MINIMUM: 10,
					SPELL_HAND_SIZE_LIMIT: 10,
					SPELL_MANA_PER_ROUND: 10,

					FIRST_GROUP_MOVES_FIRST: true,
					SECOND_GROUP_MOVES_FIRST: false,

					SKIP_MULLIGAN: true,
					MULLIGAN_INITIAL_CARD_COUNT: 10,
					MULLIGAN_ROUND_CARD_COUNT: 10,

					GAME_BOARD_ROW_COUNT: 6,
					GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode.SPLIT_IN_HALF,
				},
				objective: null,
			},
		}),
		'test-deck-id',
		document.createElement('div')
	)

	await server.connected

	return {
		receive(message: ServerToClientGameMessage): void {
			const targetThread = Core.mainHandler.registerMessage(message)
			targetThread.start()
			targetThread.tick(0)
		},

		runQueue(): void {
			// Empty
		},

		addToQueue(message: ServerToClientGameMessage): void {
			Core.executeSocketMessage(message)
		},

		teardown(): void {
			server.close()
		},
	}
}
