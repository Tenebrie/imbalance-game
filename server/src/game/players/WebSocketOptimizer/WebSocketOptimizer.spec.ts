import {
	ServerToClientGameMessage,
	ServerToClientGameMessageTypes,
} from '../../../../../shared/src/models/network/messageHandlers/ServerToClientGameMessages'
import { setupTestGame, TestGame } from '../../../utils/TestGame'
import BuffStrength from '../../buffs/BuffStrength'
import TestingUnitNoEffect from '../../cards/11-testing/TestingUnitNoEffect'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import TestingRulesetPVE from '../../rulesets/testing/TestingRulesetPVE'
import * as WebSocketOptimizer from './WebSocketOptimizer'
import { WebSocketOptimizerResponse } from './WebSocketOptimizer'

const optimizerSpy = jest.spyOn(WebSocketOptimizer, 'optimizeWebSocketQueue')

describe('WebSocketOptimizer', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVE)
	})

	it('calls optimizer function', () => {
		expect(optimizerSpy).toHaveBeenCalled()
	})

	describe('when many buffs are provided', () => {
		beforeEach(() => {
			optimizerSpy.mockClear()
			game.player.summon(TestingUnitNoEffect).receiveBuffs(BuffStrength, 500)
			OutgoingMessageHandlers.executeMessageQueue(game.handle)
		})

		it('merges buffs together', () => {
			expect(optimizerSpy).toHaveBeenCalled()
			const originalQueue = optimizerSpy.mock.calls[optimizerSpy.mock.calls.length - 1][0]
			const response = optimizerSpy.mock.results[optimizerSpy.mock.results.length - 1].value as WebSocketOptimizerResponse
			printOptimizerStats(originalQueue, response)
		})
	})
})

const printOptimizerStats = (originalQueue: ServerToClientGameMessage[], response: WebSocketOptimizerResponse): void => {
	const stats: Partial<Record<ServerToClientGameMessageTypes, number>> = {}
	response.queue.forEach((m) => {
		const val = stats[m.type]
		if (val) {
			stats[m.type] = val + 1
		} else {
			stats[m.type] = 1
		}
	})

	console.log(stats)
	console.log(response.queue.map((a) => a.type))
	const diff = originalQueue.length - response.queue.length
	const startingSize = Buffer.byteLength(JSON.stringify(originalQueue))
	const outputSize = Buffer.byteLength(JSON.stringify(response.queue))
	const sizeDiff = startingSize - outputSize
	console.log(
		`[Optimizer] Returning ${response.queue.length} messages (was ${originalQueue.length}).\n- ${Math.floor(
			(diff / originalQueue.length) * 100
		)}% reduction in message count.\n- ${bytesToString(sizeDiff)} reduction in data size (was ${bytesToString(startingSize)}).`
	)
}

const bytesToString = (bytes: number): string => {
	let unit = 'B'
	if (bytes > 1024) {
		bytes = Math.floor(bytes / 1024)
		unit = 'kB'
	}
	if (bytes > 1024) {
		bytes = Math.floor(bytes / 1024)
		unit = 'MB'
	}
	return `${bytes}${unit}`
}
