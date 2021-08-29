import TargetMode from '@shared/enums/TargetMode'
import Card from '@shared/models/Card'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import { GenericActionMessageType, SystemMessageType } from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'

import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'

export default {
	sendUnitCardPlayed(card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number): void {
		const rowIndex = Core.board.rows.indexOf(gameBoardRow)
		Core.sendMessage(GenericActionMessageType.CARD_PLAY, CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex))
	},

	sendSpellCardPlayed(card: Card): void {
		Core.sendMessage(GenericActionMessageType.CARD_PLAY, CardPlayedMessage.fromCard(card))
	},

	sendUnitOrder(order: CardTargetMessage): void {
		Core.sendMessage(GenericActionMessageType.UNIT_ORDER, order)
	},

	sendCardTarget(target: CardTargetMessage): void {
		Core.sendMessage(GenericActionMessageType.CARD_TARGET, target)
	},

	sendAnonymousTarget(target: AnonymousTargetMessage): void {
		Core.sendMessage(GenericActionMessageType.ANONYMOUS_TARGET, target)
	},

	sendConfirmTargets(targetMode: TargetMode): void {
		Core.sendMessage(GenericActionMessageType.CONFIRM_TARGETS, targetMode)
	},

	requestShowPlayersDeck(): void {
		Core.sendMessage(GenericActionMessageType.REQUEST_PLAYERS_DECK, null)
	},

	requestShowPlayersGraveyard(): void {
		Core.sendMessage(GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD, null)
	},

	requestShowOpponentsGraveyard(): void {
		Core.sendMessage(GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD, null)
	},

	sendNovelReply(reply: NovelReplyMessage): void {
		Core.sendMessage(GenericActionMessageType.NOVEL_REPLY, reply)
	},

	sendEndTurn(): void {
		Core.sendMessage(GenericActionMessageType.TURN_END, null)
	},

	sendSurrender(): void {
		Core.sendMessage(GenericActionMessageType.SURRENDER, null)
	},

	sendInit(): void {
		Core.sendMessage(SystemMessageType.INIT, null)
	},

	sendKeepalive(): void {
		Core.sendMessage(SystemMessageType.KEEPALIVE, null)
	},
}
