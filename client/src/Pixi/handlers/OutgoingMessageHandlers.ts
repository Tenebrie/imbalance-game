import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import CardTarget from '@shared/models/CardTarget'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'

export default {
	sendUnitCardPlayed(card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number): void {
		const rowIndex = Core.board.rows.indexOf(gameBoardRow)
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex))
	},

	sendSpellCardPlayed(card: Card): void {
		Core.sendMessage('post/playCard', CardPlayedMessage.fromCard(card))
	},

	sendUnitOrder(order: CardTarget): void {
		Core.sendMessage('post/unitOrder', new CardTargetMessage(order))
	},

	sendCardTarget(target: ClientCardTarget): void {
		Core.sendMessage('post/cardTarget', new CardTargetMessage(target))
	},

	sendEndTurn(): void {
		Core.sendMessage('post/endTurn', null)
	},

	sendInit(): void {
		Core.sendMessage('system/init', undefined)
	},

	sendKeepalive(): void {
		Core.sendMessage('system/keepalive', null)
	}
}
