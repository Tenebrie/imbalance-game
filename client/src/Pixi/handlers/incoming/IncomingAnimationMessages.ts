import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { AnimationMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import { QueuedMessageSystemData } from '@/Pixi/models/QueuedMessage'
import AnimationHandlers from '@/Pixi/handlers/AnimationHandlers'
import Core from '@/Pixi/Core'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'

const IncomingAnimationMessages: { [index in AnimationMessageType]: IncomingMessageHandlerFunction } = {
	[AnimationMessageType.PLAY]: (data: AnimationMessage, systemData: QueuedMessageSystemData) => {
		const handler = AnimationHandlers[data.type]
		if (!handler) {
			console.error(`Unknown animation type ${data.type}`)
			return
		}

		const animationDuration = handler(data, data.params)
		Core.mainHandler.triggerAnimation(animationDuration, systemData.animationThreadId)
	},

	[AnimationMessageType.THREAD_CREATE]: () => {
		Core.mainHandler.createAnimationThread()
	},

	[AnimationMessageType.THREAD_COMMIT]: () => {
		Core.mainHandler.commitAnimationThread()
	},

	[AnimationMessageType.THREAD_START]: (data: AnimationThreadStartMessage, systemData: QueuedMessageSystemData) => {
		const parentThread = Core.mainHandler.mainAnimationThread.findThread(systemData.animationThreadId)
		const targetThread = parentThread.workerThreads.find((thread) => !thread.started)
		const activeWorkerThreadCount = parentThread.workerThreads.filter((thread) => thread.started).length
		if (data.isStaggered && targetThread.hasAnimationMessages()) {
			targetThread.triggerCooldown(activeWorkerThreadCount * 150)
		}
		targetThread.start()
	},

	[AnimationMessageType.EXECUTE_QUEUE]: () => {
		Core.mainHandler.mainAnimationThread.start()
	},
}

export default IncomingAnimationMessages
