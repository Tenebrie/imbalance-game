import * as ws from 'ws'
import ServerPlayer from '../../players/ServerPlayer'
import ErrorCode from '@shared/enums/ErrorCode'

export default {
	notifyAboutGameShutdown(player: ServerPlayer) {
		player.sendMessage({
			type: 'command/disconnect',
			data: { reason: 'ServerGame shutdown' }
		})
	},

	notifyAboutInvalidGameID(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid game ID or player token'
		}))
	},

	notifyAboutGameAlreadyStarted(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Game has already started'
		}))
	},

	notifyAboutDuplicatedConnection(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Duplicated connection from the same client'
		}))
		ws.send(JSON.stringify({
			type: 'command/disconnect',
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutMissingDeckId(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Missing required param: deckId',
			code: ErrorCode.NO_DECK_SELECTED
		}))
		ws.send(JSON.stringify({
			type: 'command/disconnect',
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutInvalidDeck(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid deck',
			code: ErrorCode.INVALID_DECK
		}))
		ws.send(JSON.stringify({
			type: 'command/disconnect',
			data: { reason: 'Duplicated connection' }
		}))
	},

	notifyAboutInvalidMessageType(ws: ws, messageType: string) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: `Invalid or missing message type (${messageType})`
		}))
	}
}
