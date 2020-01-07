import Core from '@/Pixi/Core'
import Card from '@/shared/models/Card'
import CardPlayedMessage from '@/shared/models/network/CardPlayedMessage'

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

	sendCardPlayed: (card: Card) => {
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCard(card))
	},

	sendKeepalive: () => {
		Core.sendMessage('system/keepalive', null)
	}
}
