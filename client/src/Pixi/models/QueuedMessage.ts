import {ServerToClientMessageTypes} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

export interface QueuedMessageSystemData {
	animationThreadId: string
}

interface QueuedMessage {
	type: ServerToClientMessageTypes
	handler: (data: any, systemData: QueuedMessageSystemData) => void
	data: any
	allowBatching: boolean
	ignoreWorkerThreads: boolean
}

export default QueuedMessage
