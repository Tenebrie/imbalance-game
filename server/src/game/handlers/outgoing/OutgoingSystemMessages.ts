import * as ws from 'ws'
import ServerPlayer from '../../players/ServerPlayer'
import ErrorCode from '@shared/enums/ErrorCode'
import {GameSyncMessageType, SystemMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenPlayerInGameMessage from '@shared/models/network/playerInGame/OpenPlayerInGameMessage'

export default {
	notifyAboutSpectateMode: (player: ServerPlayer): void => {
		player.sendMessage({
			type: SystemMessageType.MODE_SPECTATE,
			data: null
		})
	},

	notifyAboutInitRequested(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.REQUEST_INIT,
			data: null
		})
	},

	notifyAboutGameShutdown(player: ServerPlayer): void {
		player.sendMessage({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'ServerGame shutdown' }
		})
	},

	notifyAboutInvalidGameID(ws: ws): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: 'Invalid game ID or player token'
		}))
	},

	notifyAboutGameAlreadyStarted(ws: ws): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: 'Game has already started'
		}))
	},

	notifyAboutDuplicatedConnection(ws: ws): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: 'Duplicated connection from the same client'
		}))
		ws.send(JSON.stringify({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutMissingDeckId(ws: ws): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: 'Missing required param: deckId',
			code: ErrorCode.NO_DECK_SELECTED
		}))
		ws.send(JSON.stringify({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutInvalidDeck(ws: ws): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: 'Invalid deck',
			code: ErrorCode.INVALID_DECK
		}))
		ws.send(JSON.stringify({
			type: SystemMessageType.COMMAND_DISCONNECT,
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutInvalidMessageType(ws: ws, messageType: string): void {
		ws.send(JSON.stringify({
			type: SystemMessageType.ERROR_GENERIC,
			data: `Invalid or missing message type (${messageType})`
		}))
	}
}
