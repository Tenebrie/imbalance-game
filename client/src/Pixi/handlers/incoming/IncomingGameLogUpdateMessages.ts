import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { GameLogUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import store from '@/Vue/store'

const IncomingGameLogUpdateMessages: { [index in GameLogUpdateMessageType]: IncomingMessageHandlerFunction } = {
	[GameLogUpdateMessageType.ENTRY]: (data: EventLogEntryMessage[]) => {
		store.dispatch.gameLogModule.addEntryGroup({
			entries: data,
		})
	},
}

export default IncomingGameLogUpdateMessages
