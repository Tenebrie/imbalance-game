export interface QueuedMessageSystemData {
	animationThreadId: string
}

interface QueuedMessage {
	handler: (data: any, systemData: QueuedMessageSystemData) => void
	data: any
	allowBatching: boolean
	ignoreWorkerThreads: boolean
}

export default QueuedMessage
