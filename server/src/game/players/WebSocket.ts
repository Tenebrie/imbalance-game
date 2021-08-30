import { compressGameTraffic } from '@shared/Utils'
import lzutf8 from 'lzutf8'
import * as ws from 'ws'

import ServerGame from '../models/ServerGame'

export class WebSocket {
	ws: ws

	constructor(webSocket: ws) {
		this.ws = webSocket
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

export class GameWebSocket extends WebSocket {
	game: ServerGame

	constructor(ws: ws, game: ServerGame) {
		super(ws)
		this.game = game
	}
}
