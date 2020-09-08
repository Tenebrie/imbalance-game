import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import CardTarget from '@shared/models/CardTarget'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import {GenericActionMessageType, SystemMessageType} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'

export default {
	sendUnitCardPlayed(card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number): void {
		const t1 = performance.now()
		const rowIndex = Core.board.rows.indexOf(gameBoardRow)
		Core.sendMessage(GenericActionMessageType.CARD_PLAY, CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex))
		const t2 = performance.now()
		console.log(`Unit played request took ${(t2 - t1).toFixed(3)}ms`)
	},

	sendSpellCardPlayed(card: Card): void {
		const t1 = performance.now()
		Core.sendMessage(GenericActionMessageType.CARD_PLAY, CardPlayedMessage.fromCard(card))
		const t2 = performance.now()
		console.log(`Spell played request took ${(t2 - t1).toFixed(3)}ms`)
	},

	sendUnitOrder(order: CardTarget): void {
		Core.sendMessage(GenericActionMessageType.UNIT_ORDER, new CardTargetMessage(order))
	},

	sendCardTarget(target: ClientCardTarget): void {
		Core.sendMessage(GenericActionMessageType.CARD_TARGET, new CardTargetMessage(target))
	},

	sendEndTurn(): void {
		Core.sendMessage(GenericActionMessageType.TURN_END, null)
	},

	sendInit(): void {
		Core.sendMessage(SystemMessageType.INIT, undefined)
	},

	sendKeepalive(): void {
		Core.sendMessage(SystemMessageType.KEEPALIVE, null)
	}
}
