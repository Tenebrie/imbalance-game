import GameCollapseMessageData from '@shared/models/network/GameCollapseMessageData'
import { SystemMessageHandlers, SystemMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import TheGameCollapsePopup from '@/Vue/components/popup/escapeMenu/TheGameCollapsePopup.vue'
import store from '@/Vue/store'

const IncomingSystemMessages: SystemMessageHandlers = {
	[SystemMessageType.MESSAGE_ACKNOWLEDGED]: () => {
		Core.performance.logMessageAcknowledge()
	},

	[SystemMessageType.PERFORMANCE_METRICS]: (data: number) => {
		Core.performance.logServerResponse(data)
	},

	[SystemMessageType.GAME_COLLAPSED]: (data: GameCollapseMessageData) => {
		store.dispatch.popupModule.open({
			// @ts-ignore
			component: TheGameCollapsePopup,
			sticky: true,
			debug: true,
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

	[SystemMessageType.ERROR_GENERIC]: (data: string) => {
		console.error('Server error:', data)
	},

	[SystemMessageType.COMMAND_DISCONNECT]: () => {
		store.dispatch.leaveGame()
		store.commit.clearNextLinkedGame()
	},
}

export default IncomingSystemMessages
