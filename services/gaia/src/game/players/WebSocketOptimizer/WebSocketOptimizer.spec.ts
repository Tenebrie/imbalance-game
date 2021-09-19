import {
	AnimationMessageType,
	GameSyncMessageType,
	ServerToClientGameMessage,
	ServerToClientGameMessageSelector,
	ServerToClientGameMessageTypes,
	ServerToClientMessageTypeMappers,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import { setupTestGame, TestGame } from '@src/utils/TestGame'
import lzutf8 from 'lzutf8'

import BuffStrength from '../../buffs/BuffStrength'
import TestingUnitNoEffect from '../../cards/11-testing/TestingUnitNoEffect'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import TestingRulesetPVE from '../../rulesets/testing/TestingRulesetPVE'
import * as WebSocketOptimizer from './WebSocketOptimizer'
import { optimizeWebSocketQueue, WebSocketOptimizerResponse } from './WebSocketOptimizer'

const optimizerSpy = jest.spyOn(WebSocketOptimizer, 'optimizeWebSocketQueue')

describe('WebSocketOptimizer', () => {
	beforeEach(() => {
		optimizerSpy.mockClear()
	})

	describe('unit tests', () => {
		describe('without optimizations required', () => {
			it('preserves all the messages', () => {
				const queue: ServerToClientGameMessage[] = [
					mockMessage(GameSyncMessageType.START),
					mockMessage(GameSyncMessageType.PHASE_ADVANCE),
					mockMessage(AnimationMessageType.EXECUTE_QUEUE),
				]

				const response = optimizeWebSocketQueue(queue)

				expect(JSON.stringify(response.queue)).toEqual(
					JSON.stringify([
						mockMessage(GameSyncMessageType.START),
						mockMessage(GameSyncMessageType.PHASE_ADVANCE),
						mockMessage(AnimationMessageType.EXECUTE_QUEUE),
					])
				)
			})
		})

		describe('with duplicated messages', () => {
			it('removes duplicates', () => {
				const queue: ServerToClientGameMessage[] = [
					mockMessage(GameSyncMessageType.START),
					mockMessage(GameSyncMessageType.PHASE_ADVANCE),
					mockMessage(GameSyncMessageType.PHASE_ADVANCE),
					mockMessage(GameSyncMessageType.PHASE_ADVANCE),
					mockMessage(AnimationMessageType.EXECUTE_QUEUE),
				]

				const response = optimizeWebSocketQueue(queue)

				expect(JSON.stringify(response.queue)).toEqual(
					JSON.stringify([
						mockMessage(GameSyncMessageType.START),
						mockMessage(GameSyncMessageType.PHASE_ADVANCE),
						mockMessage(AnimationMessageType.EXECUTE_QUEUE),
					])
				)
			})
		})
	})

	describe('integration tests', () => {
		let game: TestGame

		beforeEach(() => {
			game = setupTestGame(TestingRulesetPVE)
		})

		it('calls optimizer function', () => {
			expect(optimizerSpy).toHaveBeenCalled()
		})

		describe('when many buffs are provided', () => {
			beforeEach(() => {
				game.player.summon(TestingUnitNoEffect).receiveBuffs(BuffStrength, 50)
				OutgoingMessageHandlers.executeMessageQueue(game.handle)
			})

			it('merges buffs together', () => {
				expect(optimizerSpy).toHaveBeenCalled()
				const response = optimizerSpy.mock.results[optimizerSpy.mock.results.length - 1].value as WebSocketOptimizerResponse
				expect(Object.values(getStats(response)).every((v) => v <= 3)).toEqual(true)
			})
		})
	})
})

const getStats = (response: WebSocketOptimizerResponse): Partial<Record<ServerToClientGameMessageTypes, number>> => {
	const stats: Partial<Record<ServerToClientGameMessageTypes, number>> = {}
	response.queue.forEach((m) => {
		const val = stats[m.type]
		if (val) {
			stats[m.type] = val + 1
		} else {
			stats[m.type] = 1
		}
	})
	return stats
}

const _printOptimizerStats = (originalQueue: ServerToClientGameMessage[], response: WebSocketOptimizerResponse): void => {
	const _stats = getStats(response)

	// console.debug(stats)
	// console.debug(response.queue.map((a) => a.type))
	const diff = originalQueue.length - response.queue.length
	const startingSize = Buffer.byteLength(JSON.stringify(originalQueue))
	const outputSize = Buffer.byteLength(JSON.stringify(response.queue))
	const sizeDiff = startingSize - outputSize
	const compressedSizeBefore = Buffer.byteLength(
		lzutf8.compress(JSON.stringify(originalQueue), {
			outputEncoding: 'BinaryString',
		})
	)
	const compressedSizeAfter = Buffer.byteLength(
		lzutf8.compress(JSON.stringify(response.queue), {
			outputEncoding: 'BinaryString',
		})
	)
	const compressedSizeDiff = compressedSizeBefore - compressedSizeAfter
	// console.debug(JSON.stringify(response.queue))

	const string1 = `Returning ${response.queue.length} messages (was ${originalQueue.length}).`
	const string2 = `- ${Math.floor((diff / originalQueue.length) * 100)}% reduction in message count.`
	const string3 = `- ${bytesToString(sizeDiff)} reduction in data size before compression (was ${bytesToString(startingSize)}).`
	const string4 = `- ${bytesToString(compressedSizeDiff)} reduction in data size after compression (was ${bytesToString(
		compressedSizeBefore
	)}).`
	const string5 = `- ${Math.floor(((outputSize - compressedSizeAfter) / outputSize) * 100)}% data compressability (was ${Math.floor(
		((startingSize - compressedSizeBefore) / startingSize) * 100
	)}%).`

	console.debug(`[Optimizer] - ${string1}\n${string2}\n${string3}\n${string4}\n${string5}`)
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

const mockMessage = <K extends ServerToClientGameMessageTypes>(type: K): ServerToClientGameMessageSelector<K> => {
	const mockDataOf = <K extends ServerToClientGameMessageTypes>(_type: K): ServerToClientMessageTypeMappers[K] => {
		return (jest.fn() as unknown) as ServerToClientMessageTypeMappers[K]
	}

	return {
		type,
		data: mockDataOf(type),
	}
}
