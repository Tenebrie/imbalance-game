import * as ws from 'ws'

export default class PlayerWebSocket {
	ws: ws

	constructor(webSocket: ws) {
		this.ws = webSocket
	}

	send(json: Record<string, any>): void {
		if (this.ws.readyState != 1) { return }

		this.ws.send(JSON.stringify(json))
	}

	close(): void {
		this.ws.close()
	}

	static newInstance(ws: ws): PlayerWebSocket {
		return new PlayerWebSocket(ws)
	}
}
