import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import CardTarget from '@shared/models/CardTarget'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'

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

	sendUnitOrder(order: CardTarget) {
		Core.sendMessage('post/unitOrder', new CardTargetMessage(order))
	},

	sendCardTarget(target: ClientCardTarget) {
		Core.sendMessage('post/cardTarget', new CardTargetMessage(target))
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
