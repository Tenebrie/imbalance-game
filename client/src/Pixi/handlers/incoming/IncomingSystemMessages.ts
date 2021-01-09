import store from '@/Vue/store'
import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { SystemMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import GameCollapseMessageData from '@shared/models/network/GameCollapseMessageData'
import TheGameCollapsePopup from '@/Vue/components/popup/escapeMenu/TheGameCollapsePopup.vue'

const IncomingSystemMessages: { [index in SystemMessageType]: IncomingMessageHandlerFunction } = {
	[SystemMessageType.MESSAGE_ACKNOWLEDGED]: () => {
		Core.performance.logMessageAcknowledge()
	},

	[SystemMessageType.PERFORMANCE_METRICS]: (data: number) => {
		Core.performance.logServerResponse(data)
	},

	[SystemMessageType.GAME_COLLAPSED]: (data: GameCollapseMessageData) => {
		store.dispatch.popupModule.open({
			component: TheGameCollapsePopup,
			sticky: true,
			params: data,
		})
	},

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
