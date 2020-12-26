import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { AnimationMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import { QueuedMessageSystemData } from '@/Pixi/models/QueuedMessage'
import AnimationHandlers from '@/Pixi/handlers/AnimationHandlers'
import Core from '@/Pixi/Core'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'
import AnimationDuration from '@shared/enums/AnimationDuration'

const IncomingAnimationMessages: { [index in AnimationMessageType]: IncomingMessageHandlerFunction } = {
	[AnimationMessageType.PLAY]: (data: AnimationMessage, systemData: QueuedMessageSystemData) => {
		const handler = AnimationHandlers[data.type]
		const handlerResponse = handler(data, data.params)
		if (!handlerResponse || !handlerResponse.skip) {
			Core.mainHandler.triggerAnimation(AnimationDuration[data.type], systemData.animationThreadId)
		}
	},

	[AnimationMessageType.THREAD_CREATE]: (data: AnimationThreadStartMessage) => {
		Core.mainHandler.createAnimationThread(data.isStaggered)
	},

	[AnimationMessageType.THREAD_COMMIT]: () => {
		Core.mainHandler.commitAnimationThread()
	},

	[AnimationMessageType.THREAD_START]: (data: AnimationThreadStartMessage, systemData: QueuedMessageSystemData) => {
		const parentThread = Core.mainHandler.mainAnimationThread.findThread(systemData.animationThreadId)
		const targetThread = parentThread.workerThreads.find((thread) => !thread.started)
		const activeStaggeredWorkerThreadCount = parentThread.workerThreads.filter(
			(thread) => thread.started && thread.isStaggered && thread.hasAnimationMessages()
		).length
		if (data.isStaggered && targetThread.hasAnimationMessages()) {
			targetThread.triggerCooldown(activeStaggeredWorkerThreadCount * 150)
		}
		targetThread.start()
	},

	[AnimationMessageType.EXECUTE_QUEUE]: () => {
		Core.performance.logQueueExecution()
		Core.mainHandler.mainAnimationThread.start()
	},
}

export default IncomingAnimationMessages
