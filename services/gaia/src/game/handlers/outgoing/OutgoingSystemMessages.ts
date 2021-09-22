import ErrorCode from '@shared/enums/ErrorCode'
import GameCollapseMessageData from '@shared/models/network/GameCollapseMessageData'
import { SystemMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import ServerGame from '@src/game/models/ServerGame'
import * as ws from 'ws'

import ServerPlayer from '../../players/ServerPlayer'

export default {
	notifyAboutMessageAcknowledged(player: ServerPlayer): void {
		player.sendGameMessage({
			type: SystemMessageType.MESSAGE_ACKNOWLEDGED,
			data: null,
			skipQueue: true,
		})
	},

	notifyAboutPerformanceMetrics(player: ServerPlayer, lastActionTiming: number): void {
		player.sendGameMessage({
			type: SystemMessageType.PERFORMANCE_METRICS,
			data: lastActionTiming,
			skipQueue: true,
		})
	},

	notifyAboutGameCollapsed(player: ServerPlayer, game: ServerGame): void {
		const data: GameCollapseMessageData = {
			gameId: game.id,
			playerId: player.id,
			timestamp: new Date().toISOString(),
		}
		player.sendGameMessage({
			type: SystemMessageType.GAME_COLLAPSED,
			data: data,
			skipQueue: true,
		})
	},

	notifyAboutSpectateMode(player: ServerPlayer): void {
		player.sendGameMessage({
			type: SystemMessageType.MODE_SPECTATE,
			data: null,
			skipQueue: true,
		})
	},

	notifyAboutInitRequested(player: ServerPlayer): void {
		player.sendGameMessage({
			type: SystemMessageType.REQUEST_INIT,
			data: null,
			skipQueue: true,
		})
	},

	notifyAboutGameShutdown(player: ServerPlayer): void {
		player.sendGameMessage({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'ServerGame shutdown' },
			skipQueue: true,
		})
	},

	notifyAboutInvalidGameID(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Invalid game ID or player token',
				skipQueue: true,
			})
		)
	},

	notifyAboutGameAlreadyStarted(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Game has already started',
				skipQueue: true,
			})
		)
	},

	notifyAboutDuplicatedConnection(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Duplicated connection from the same client',
				skipQueue: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Duplicated connection' },
				skipQueue: true,
			})
		)
	},

	notifyAboutMissingDeckId(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Missing required param: deckId',
				code: ErrorCode.NO_DECK_SELECTED,
				skipQueue: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Missing required param: deckId' },
				skipQueue: true,
			})
		)
	},

	notifyAboutMissingGroupId(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Missing required param: groupId',
				code: ErrorCode.NO_GROUP_SELECTED,
				skipQueue: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Missing required param: groupId' },
				skipQueue: true,
			})
		)
	},

	notifyAboutInvalidDeck(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Invalid deck',
				code: ErrorCode.INVALID_DECK,
				skipQueue: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Invalid deck' },
				skipQueue: true,
			})
		)
	},

	notifyAboutInvalidGroupId(ws: ws): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: 'Invalid group ID provided',
				code: ErrorCode.INVALID_GROUP_ID,
				skipQueue: true,
			})
		)
		ws.send(
			JSON.stringify({
				type: SystemMessageType.COMMAND_DISCONNECT,
				data: { reason: 'Invalid group ID provided' },
				skipQueue: true,
			})
		)
	},

	notifyAboutInvalidMessageType(ws: ws, messageType: string): void {
		ws.send(
			JSON.stringify({
				type: SystemMessageType.ERROR_GENERIC,
				data: `Invalid or missing message type (${messageType})`,
				skipQueue: true,
			})
		)
	},
}
