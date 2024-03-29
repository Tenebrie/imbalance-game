import AnimationDuration from '@shared/enums/AnimationDuration'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'
import { AnimationMessageHandlers, AnimationMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

import Core from '@/Pixi/Core'
import AnimationHandlers from '@/Pixi/handlers/AnimationHandlers'
import { QueuedMessageSystemData } from '@/Pixi/models/QueuedMessage'

const IncomingAnimationMessages: AnimationMessageHandlers = {
	[AnimationMessageType.PLAY]: (data: AnimationMessage, systemData: QueuedMessageSystemData) => {
		const handler = AnimationHandlers[data.type]
		const handlerResponse = handler(data, data.params)
		if (!handlerResponse || !handlerResponse.skip) {
			const extraDuration = (handlerResponse && handlerResponse.extraDelay) || 0
			const time = AnimationDuration[data.type] + extraDuration
			Core.mainHandler.triggerAnimation(time, systemData.animationThreadId)
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
		if (!parentThread) {
			console.error('No parent animation thread found')
			return
		}
		const targetThread = parentThread.workerThreads.find((thread) => !thread.started)
		if (!targetThread) {
			console.error('No queued animation threads found')
			return
		}
		const activeStaggeredWorkerThreadCount = parentThread.workerThreads.filter(
			(thread) => thread.started && thread.isStaggered && thread.hasAnimationMessages()
		).length
		if (data.isStaggered && targetThread.hasAnimationMessages()) {
			const animationCooldown = Core.game.turnPhase === GameTurnPhase.ROUND_END ? 50 : 150
			targetThread.triggerCooldown(activeStaggeredWorkerThreadCount * animationCooldown)
		}
		targetThread.start()
	},

	[AnimationMessageType.EXECUTE_QUEUE]: () => {
		Core.performance.logQueueFlush()
		Core.mainHandler.mainAnimationThread.start()
	},
}

export default IncomingAnimationMessages
