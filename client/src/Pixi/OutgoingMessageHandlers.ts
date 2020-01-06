import Core from '@/Pixi/Core'

export default {
	getChat: () => {
		Core.sendMessage('get/chat', null)
	},

	getHand: () => {
		Core.sendMessage('get/hand', null)
	},

	getDeck: () => {
		Core.sendMessage('get/deck', null)
	},

	getOpponent: () => {
		Core.sendMessage('get/opponent', null)
	},

	getBoardState: () => {
		Core.sendMessage('get/boardState', null)
	},

	sendChatMessage: (message: string) => {
		Core.sendMessage('post/chat', message)
	},

	sendKeepalive: () => {
		Core.sendMessage('system/keepalive', null)
	}
}
