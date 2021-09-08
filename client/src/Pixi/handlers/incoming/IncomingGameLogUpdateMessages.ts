import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { GameLogUpdateMessageHandlers, GameLogUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

import store from '@/Vue/store'

const IncomingGameLogUpdateMessages: GameLogUpdateMessageHandlers = {
	[GameLogUpdateMessageType.ENTRY]: (data: EventLogEntryMessage[]) => {
		store.dispatch.gameLogModule.addEntryGroup({
			entries: data,
		})
	},
}

export default IncomingGameLogUpdateMessages
