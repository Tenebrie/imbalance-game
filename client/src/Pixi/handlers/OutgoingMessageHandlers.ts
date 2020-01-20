import Core from '@/Pixi/Core'
import Card from '@/Pixi/shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import CardPlayedMessage from '@/Pixi/shared/models/network/CardPlayedMessage'
import AttackOrderMessage from '@/Pixi/shared/models/network/AttackOrderMessage'
import AttackOrder from '@/Pixi/shared/models/AttackOrder'
import MoveOrder from '../shared/models/MoveOrder'
import MoveOrderMessage from '../shared/models/network/MoveOrderMessage'

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

	sendUnitMoveOrders(order: MoveOrder) {
		Core.sendMessage('post/moveOrder', MoveOrderMessage.fromUnitAndIndex(order.unit, order.targetRow.index))
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
