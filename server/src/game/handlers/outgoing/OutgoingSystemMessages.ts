import * as ws from 'ws'
import ServerPlayer from '../../players/ServerPlayer'
import ErrorCode from '@shared/enums/ErrorCode'
import { SystemMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import GameCollapseMessageData from '@shared/models/network/GameCollapseMessageData'
import ServerGame from '@src/game/models/ServerGame'

export default {
	notifyAboutMessageAcknowledged(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.MESSAGE_ACKNOWLEDGED,
			data: null,
			highPriority: true,
		})
	},

	notifyAboutPerformanceMetrics(player: ServerPlayer, lastActionTiming: number): void {
		player.sendMessage({
			type: SystemMessageType.PERFORMANCE_METRICS,
			data: lastActionTiming,
			highPriority: true,
		})
	},

	notifyAboutGameCollapsed(player: ServerPlayer, game: ServerGame): void {
		const data: GameCollapseMessageData = {
			gameId: game.id,
			playerId: player.id,
			timestamp: new Date().toISOString(),
		}
		player.sendMessage({
			type: SystemMessageType.GAME_COLLAPSED,
			data: data,
			highPriority: true,
		})
	},

	notifyAboutSpectateMode(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.MODE_SPECTATE,
			data: null,
			highPriority: true,
		})
	},

	notifyAboutInitRequested(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.REQUEST_INIT,
			data: null,
			highPriority: true,
		})
	},

	notifyAboutGameShutdown(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'ServerGame shutdown' },
			highPriority: true,
		})
	},

	notifyAboutInvalidGameID(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Invalid game ID or player token',
				highPriority: true,
			})
		)
	},

	notifyAboutGameAlreadyStarted(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Game has already started',
				highPriority: true,
			})
		)
	},

	notifyAboutDuplicatedConnection(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Duplicated connection from the same client',
				highPriority: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Duplicated connection' },
				highPriority: true,
			})
		)
	},

	notifyAboutMissingDeckId(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Missing required param: deckId',
				code: ErrorCode.NO_DECK_SELECTED,
				highPriority: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Duplicated connection' },
				highPriority: true,
			})
		)
	},

	notifyAboutInvalidDeck(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Invalid deck',
				code: ErrorCode.INVALID_DECK,
				highPriority: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Duplicated connection' },
				highPriority: true,
			})
		)
	},

	notifyAboutInvalidMessageType(ws: ws, messageType: string): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: `Invalid or missing message type (${messageType})`,
				highPriority: true,
			})
		)
	},
}
