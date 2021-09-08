import {
	ServerToClientGameMessageSelector,
	ServerToClientMessageTypeMappers,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

export interface QueuedMessageSystemData {
	animationThreadId: string
}

export type QueuedMessage = ServerToClientGameMessageSelector<keyof ServerToClientMessageTypeMappers>

export default QueuedMessage
