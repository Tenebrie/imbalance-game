import store from '@/Vue/store'
import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { SystemMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'

const IncomingSystemMessages: { [index in SystemMessageType]: IncomingMessageHandlerFunction } = {
	[SystemMessageType.MODE_SPECTATE]: () => {
		store.commit.gameStateModule.setIsSpectating(true)
	},

	[SystemMessageType.REQUEST_INIT]: () => {
		if (Core.isReady) {
			OutgoingMessageHandlers.sendInit()
		}
	},

	[SystemMessageType.COMMAND_DISCONNECT]: () => {
		store.dispatch.leaveGame()
	},

	[SystemMessageType.ERROR_GENERIC]: (data: string) => {
		console.error('Server error:', data)
	},
}

export default IncomingSystemMessages
