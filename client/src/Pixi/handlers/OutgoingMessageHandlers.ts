import Core from '@/Pixi/Core'
import Card from '@/Pixi/shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import CardPlayedMessage from '@/Pixi/shared/models/network/CardPlayedMessage'
import UnitOrderMessage from '@/Pixi/shared/models/network/UnitOrderMessage'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'

export default {
	sendChatMessage(message: string) {
		Core.sendMessage('post/chat', message)
	},

	sendUnitCardPlayed(card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number) {
		const rowIndex = Core.board.rows.indexOf(gameBoardRow)
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex))
	},

	sendSpellCardPlayed(card: Card) {
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCard(card))
	},

	sendUnitOrder(order: UnitOrder) {
		Core.sendMessage('post/unitOrder', new UnitOrderMessage(order))
	},

	sendEndTurn() {
		Core.sendMessage('post/endTurn', null)
	},

	sendInit() {
		Core.sendMessage('system/init', null)
	},

	sendKeepalive() {
		Core.sendMessage('system/keepalive', null)
	}
}
