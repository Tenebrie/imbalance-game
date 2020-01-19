import Core from '@/Pixi/Core'
import Card from '@/Pixi/shared/models/Card'
import RenderedCard from '@/Pixi/models/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import CardPlayedMessage from '@/Pixi/shared/models/network/CardPlayedMessage'
import AttackOrderMessage from '@/Pixi/shared/models/network/AttackOrderMessage'
import AttackOrder from '@/Pixi/shared/models/AttackOrder'

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

	sendUnitAttackOrders(order: AttackOrder) {
		Core.sendMessage('post/attackOrder', AttackOrderMessage.fromAttackOrder(order))
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
