import * as ws from 'ws'
import PlayerWebSocket from './PlayerWebSocket'
import Player from '@shared/models/Player'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'

export default class ServerPlayer extends Player {
	id: string
	email: string
	username: string
	webSocket: PlayerWebSocket

	constructor(id: string, email: string, username: string) {
		super(id, username)
		this.id = id
		this.email = email
		this.username = username
		this.webSocket = null
	}

	registerConnection(ws: ws): void {
		this.webSocket = PlayerWebSocket.newInstance(ws)
	}

	sendMessage(json: { type: string, data: any, highPriority?: boolean, ignoreWorkerThreads?: boolean, allowBatching?: boolean }): void {
		if (!this.webSocket) {
			console.warn('Trying to send message to disconnected player')
			return
		}
		this.webSocket.send(json)
	}

	disconnect(): void {
		if (!this.isInGame()) { return }

		this.webSocket.close()
		this.webSocket = undefined
	}

	isInGame(): boolean {
		return !!this.webSocket
	}

	static newInstance(playerDatabaseEntry: PlayerDatabaseEntry): ServerPlayer {
		return new ServerPlayer(playerDatabaseEntry.id, playerDatabaseEntry.email, playerDatabaseEntry.username)
	}
}
