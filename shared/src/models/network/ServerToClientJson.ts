import { ServerToClientMessageTypes } from './messageHandlers/ServerToClientMessageTypes'

export type ServerToClientJson = {
	type: ServerToClientMessageTypes
	data: any
	highPriority?: boolean
	ignoreWorkerThreads?: boolean
	allowBatching?: boolean
}
