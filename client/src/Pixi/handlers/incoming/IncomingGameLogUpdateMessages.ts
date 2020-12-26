import store from '@/Vue/store'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { GameLogUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

const IncomingGameLogUpdateMessages: { [index in GameLogUpdateMessageType]: IncomingMessageHandlerFunction } = {
	[GameLogUpdateMessageType.ENTRY]: (data: EventLogEntryMessage[]) => {
		store.dispatch.gameLogModule.addEntryGroup({
			entries: data,
		})
	},
}

export default IncomingGameLogUpdateMessages
