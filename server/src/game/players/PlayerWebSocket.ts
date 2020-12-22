import * as ws from 'ws'
import ServerGame from '../models/ServerGame'

export default class PlayerWebSocket {
	ws: ws
	game: ServerGame

	constructor(webSocket: ws, game: ServerGame) {
		this.ws = webSocket
		this.game = game
	}

	send(json: Record<string, any>): void {
		if (this.ws.readyState != 1) {
			return
		}

		this.ws.send(JSON.stringify(json))
	}

	close(): void {
		this.ws.close()
	}

	static newInstance(ws: ws, game: ServerGame): PlayerWebSocket {
		return new PlayerWebSocket(ws, game)
	}
}
