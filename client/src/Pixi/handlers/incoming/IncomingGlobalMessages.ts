import { ServerToClientGlobalMessageHandlers, WebMessageType } from '@shared/models/network/messageHandlers/WebMessageTypes'

import store from '@/Vue/store'

export const IncomingGlobalMessages: ServerToClientGlobalMessageHandlers = {
	[WebMessageType.GAMES_INFO]: (data) => {
		store.dispatch.gamesListModule.setGames(data)
	},
	[WebMessageType.GAME_CREATED]: (data) => {
		store.dispatch.gamesListModule.addGame(data)
	},
	[WebMessageType.GAME_UPDATED]: (data) => {
		store.dispatch.gamesListModule.updateGame(data)
	},
	[WebMessageType.GAME_DESTROYED]: (data) => {
		store.dispatch.gamesListModule.removeGame(data)
	},
}
