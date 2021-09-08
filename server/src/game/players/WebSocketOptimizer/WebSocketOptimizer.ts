import GroupAnimationThreadNext from '@shared/models/network/groupWrappers/GroupAnimationThreadNext'
import GroupGenericLoop from '@shared/models/network/groupWrappers/GroupGenericLoop'
import {
	AnimationMessageType,
	CardUpdateMessageType,
	GroupMessageType,
	PlayerUpdateMessageType,
	ServerToClientGameMessage,
	ServerToClientGameMessageSelector,
	ServerToClientMessageTypeMappers,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

type WrappedMessage = {
	index: number
	message: ServerToClientGameMessage
}

export type WebSocketOptimizerResponse = {
	queue: ServerToClientGameMessage[]
}

export const optimizeWebSocketQueue = (queue: ServerToClientGameMessage[]): WebSocketOptimizerResponse => {
	let tempQueue: WrappedMessage[] = queue.map((message, index) => ({
		index,
		message,
	}))

	// May need to be disabled for performance reasons
	// Identical messages
	tempQueue = (() => {
		let count = 0
		const swapQueue: WrappedMessage[] = Array(tempQueue.length)
		tempQueue.forEach((m1) => {
			if (
				!swapQueue.some(
					(m2) =>
						Math.abs(m2.index - m1.index) === 1 &&
						m1.message.type === m2.message.type &&
						JSON.stringify(m1.message) === JSON.stringify(m2.message)
				)
			) {
				swapQueue[count++] = m1
			}
		})
		return swapQueue
	})()

	// Next thread
	tempQueue = applyPattern(
		tempQueue,
		[AnimationMessageType.THREAD_COMMIT, AnimationMessageType.THREAD_CREATE, AnimationMessageType.THREAD_START],
		(messages) => ({
			type: GroupMessageType.THREAD_NEXT,
			data: new GroupAnimationThreadNext({
				commitMessage: messages[0],
				createMessage: messages[1],
				startMessage: messages[2],
			}),
		})
	)

	// Unit buff
	tempQueue = applyPattern(
		tempQueue,
		[CardUpdateMessageType.CARD_BUFF_ADD, CardUpdateMessageType.STATS, AnimationMessageType.PLAY, GroupMessageType.THREAD_NEXT],
		(messages) => ({
			type: GroupMessageType.CARD_BUFF,
			data: null,
		})
	)

	// Merge consecutive
	tempQueue = (() => {
		if (tempQueue.length === 0) {
			return []
		}

		let swapQueue: WrappedMessage[] = []
		let currentValues: WrappedMessage[] = [tempQueue[0]]
		for (let i = 1; i < tempQueue.length; i++) {
			if (!tempQueue[i]) {
				continue
			}
			const last = currentValues[currentValues.length - 1].message
			const current = tempQueue[i].message
			if (current.type === last.type && current.highPriority === last.highPriority && i !== tempQueue.length - 1) {
				currentValues.push(tempQueue[i])
				continue
			}
			if (currentValues.length > 3) {
				swapQueue.push({
					index: currentValues[0].index,
					message: {
						type: GroupMessageType.GENERIC_LOOP,
						data: new GroupGenericLoop(),
					},
				})
			} else {
				swapQueue = swapQueue.concat(currentValues)
			}
			currentValues = [tempQueue[i]]
		}
		return swapQueue
	})()

	// Overridden messages
	const overriddenMessageTypes = [
		PlayerUpdateMessageType.PLAY_TARGETS,
		PlayerUpdateMessageType.UNIT_ORDERS_SELF,
		PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT,
	]
	overriddenMessageTypes.forEach((messageType) => {
		const messagesOfType = tempQueue.filter((m) => m.message.type === messageType)
		if (messagesOfType.length <= 1) {
			return
		}
		const removedMessages = messagesOfType.slice(0, messagesOfType.length - 2)
		tempQueue = tempQueue.filter((m) => !removedMessages.includes(m))
	})

	tempQueue.sort((a, b) => a.index - b.index)

	console.log(`Time: ${t1[1] / 1000000}`)

	return {
		queue: tempQueue.map((m) => m.message),
	}
}

function applyPattern<A extends keyof ServerToClientMessageTypeMappers>(
	queue: WrappedMessage[],
	messageTypes: [A],
	getGroupedMessage: (messages: [ServerToClientGameMessageSelector<A>]) => ServerToClientGameMessage
): WrappedMessage[]
function applyPattern<A extends keyof ServerToClientMessageTypeMappers, B extends keyof ServerToClientMessageTypeMappers>(
	queue: WrappedMessage[],
	messageTypes: [A, B],
	getGroupedMessage: (messages: [ServerToClientGameMessageSelector<A>, ServerToClientGameMessageSelector<B>]) => ServerToClientGameMessage
): WrappedMessage[]
function applyPattern<
	A extends keyof ServerToClientMessageTypeMappers,
	B extends keyof ServerToClientMessageTypeMappers,
	C extends keyof ServerToClientMessageTypeMappers
>(
	queue: WrappedMessage[],
	messageTypes: [A, B, C],
	getGroupedMessage: (
		messages: [ServerToClientGameMessageSelector<A>, ServerToClientGameMessageSelector<B>, ServerToClientGameMessageSelector<C>]
	) => ServerToClientGameMessage
): WrappedMessage[]
function applyPattern<
	A extends keyof ServerToClientMessageTypeMappers,
	B extends keyof ServerToClientMessageTypeMappers,
	C extends keyof ServerToClientMessageTypeMappers,
	D extends keyof ServerToClientMessageTypeMappers
>(
	queue: WrappedMessage[],
	messageTypes: [A, B, C, D],
	getGroupedMessage: (
		messages: [
			ServerToClientGameMessageSelector<A>,
			ServerToClientGameMessageSelector<B>,
			ServerToClientGameMessageSelector<C>,
			ServerToClientGameMessageSelector<D>
		]
	) => ServerToClientGameMessage
): WrappedMessage[]
function applyPattern(
	queue: WrappedMessage[],
	messageTypes: ServerToClientMessageTypeMappers[],
	getGroupedMessage: (messages: any) => ServerToClientGameMessage
): WrappedMessage[] {
	queue
		.filter((m) => messageTypes.every((type, index) => queue[queue.indexOf(m) + index]?.message.type === type))
		.forEach((firstMessage, index) => {
			const messages = messageTypes.map((_, offset) => queue[index + offset].message)
			const nextMessage = getGroupedMessage(messages)
			queue.splice(queue.indexOf(firstMessage), messageTypes.length, {
				index: firstMessage.index,
				message: nextMessage,
			})
		})
	return queue
}
