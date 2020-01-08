import Core from '@/Pixi/Core'
import Card from '@/shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
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

	sendUnitCardPlayed: (card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number) => {
		const rowIndex = Core.gameBoard.rows.indexOf(gameBoardRow)
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex))
	},

	sendSpellCardPlayed: (card: Card) => {
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCard(card))
	},

	sendKeepalive: () => {
		Core.sendMessage('system/keepalive', null)
	}
}
