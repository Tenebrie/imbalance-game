import TargetMode from '@shared/enums/TargetMode'
import Card from '@shared/models/Card'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import { GenericActionMessageType, SystemMessageType } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'

import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'

export default {
	sendUnitCardPlayed(card: Card, gameBoardRow: RenderedGameBoardRow, unitIndex: number): void {
		const rowIndex = Core.board.rows.indexOf(gameBoardRow)
		Core.sendMessage({
			type: GenericActionMessageType.CARD_PLAY,
			data: CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex),
		})
	},

	sendSpellCardPlayed(card: Card): void {
		Core.sendMessage({
			type: GenericActionMessageType.CARD_PLAY,
			data: CardPlayedMessage.fromCard(card),
		})
	},

	sendUnitOrder(order: CardTargetMessage): void {
		Core.sendMessage({
			type: GenericActionMessageType.UNIT_ORDER,
			data: order,
		})
	},

	sendCardTarget(target: CardTargetMessage): void {
		Core.sendMessage({
			type: GenericActionMessageType.CARD_TARGET,
			data: target,
		})
	},

	sendAnonymousTarget(target: AnonymousTargetMessage): void {
		Core.sendMessage({
			type: GenericActionMessageType.ANONYMOUS_TARGET,
			data: target,
		})
	},

	sendConfirmTargets(targetMode: TargetMode): void {
		Core.sendMessage({
			type: GenericActionMessageType.CONFIRM_TARGETS,
			data: targetMode,
		})
	},

	requestShowPlayersDeck(): void {
		Core.sendMessage({
			type: GenericActionMessageType.REQUEST_PLAYERS_DECK,
			data: null,
		})
	},

	requestShowPlayersGraveyard(): void {
		Core.sendMessage({
			type: GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD,
			data: null,
		})
	},

	requestShowOpponentsGraveyard(): void {
		Core.sendMessage({
			type: GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD,
			data: null,
		})
	},

	sendNovelChapterMove(chapterId: string): void {
		Core.sendMessage({
			type: GenericActionMessageType.NOVEL_CHAPTER,
			data: chapterId,
		})
	},

	sendNovelContinue(): void {
		Core.sendMessage({
			type: GenericActionMessageType.NOVEL_CONTINUE,
			data: null,
		})
	},

	sendEndTurn(): void {
		Core.sendMessage({
			type: GenericActionMessageType.TURN_END,
			data: null,
		})
	},

	sendSurrender(): void {
		Core.sendMessage({
			type: GenericActionMessageType.SURRENDER,
			data: null,
		})
	},

	sendInit(): void {
		Core.sendMessage({
			type: SystemMessageType.INIT,
			data: null,
		})
	},

	sendKeepalive(): void {
		Core.sendMessage({
			type: SystemMessageType.KEEPALIVE,
			data: null,
		})
	},
}
