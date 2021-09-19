import {
	AnimationMessageType,
	ServerToClientGameMessage,
	ServerToClientGameMessageTypes,
	SystemMessageType,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import { compressGameTraffic } from '@shared/Utils'
import { optimizeWebSocketQueue } from '@src/game/players/WebSocketOptimizer/WebSocketOptimizer'
import lzutf8 from 'lzutf8'
import * as ws from 'ws'

import ServerGame from '../models/ServerGame'

export class WebSocket {
	ws: ws
	id: string

	constructor(webSocket: ws, id: string) {
		this.ws = webSocket
		this.id = id
	}

	send(json: Record<string, any>): void {
		if (this.ws.readyState != 1) {
			return
		}

		let data = JSON.stringify(json)
		data = data.replace(/buff:[a-zA-Z_0-9]+:/g, 'buff::')
		data = data.replace(/card:[a-zA-Z_0-9]+:/g, 'card::')
		if (compressGameTraffic()) {
			data = lzutf8.compress(JSON.stringify(json), {
				outputEncoding: 'BinaryString',
			})
		}
		this.ws.send(data)
	}

	close(): void {
		this.ws.close()
	}
}

const EXCLUDED_TYPES: ServerToClientGameMessageTypes[] = [
	SystemMessageType.MESSAGE_ACKNOWLEDGED,
	SystemMessageType.PERFORMANCE_METRICS,
	SystemMessageType.GAME_COLLAPSED,
	SystemMessageType.MODE_SPECTATE,
	SystemMessageType.REQUEST_INIT,
	SystemMessageType.ERROR_GENERIC,
	SystemMessageType.COMMAND_DISCONNECT,
]

export class GameWebSocket extends WebSocket {
	game: ServerGame
	queue: ServerToClientGameMessage[] = []

	constructor(ws: ws, game: ServerGame) {
		super(ws, 'game')
		this.game = game
	}

	send(json: ServerToClientGameMessage): void {
		if (EXCLUDED_TYPES.includes(json.type)) {
			super.send(json)
			return
		}

		this.queue.push(json)
		if (json.type === AnimationMessageType.EXECUTE_QUEUE) {
			const optimizerResponse = optimizeWebSocketQueue(this.queue)
			optimizerResponse.queue.forEach((queuedJson) => super.send(queuedJson))
			this.queue = []
		}
	}
}
