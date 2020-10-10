import * as ws from 'ws'
import PlayerWebSocket from './PlayerWebSocket'
import Player from '@shared/models/Player'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import {ServerToClientMessageTypes} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ServerPlayerSpectator from './ServerPlayerSpectator'
import ServerGame from '../models/ServerGame'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayerInGame from './ServerPlayerInGame'

type MessageJson = { type: ServerToClientMessageTypes, data: any, highPriority?: boolean, ignoreWorkerThreads?: boolean, allowBatching?: boolean }

export default class ServerPlayer implements Player {
	id: string
	email: string
	username: string
	webSocket: PlayerWebSocket | null
	spectators: ServerPlayerSpectator[]

	constructor(id: string, email: string, username: string) {
		this.id = id
		this.email = email
		this.username = username
		this.webSocket = null
		this.spectators = []
	}

	public get game(): ServerGame | null {
		return GameLibrary.games.find(game => game.players.map(playerInGame => playerInGame.player).includes(this)) || null
	}

	public get playerInGame(): ServerPlayerInGame | null {
		return this.game?.players.find(playerInGame => playerInGame.player === this) || null
	}

	registerConnection(ws: ws): void {
		this.webSocket = PlayerWebSocket.newInstance(ws)
	}

	sendMessage(json: MessageJson): void {
		if (!this.webSocket) {
			console.warn('Trying to send message to disconnected player')
			return
		}
		this.webSocket.send(json)
		this.spectators.forEach(spectator => spectator.player.sendMessage(json))
	}

	disconnect(): void {
		if (!this.isInGame() || !this.webSocket) { return }

		this.webSocket.close()
		this.webSocket = null
	}

	isInGame(): boolean {
		return !!this.webSocket
	}

	public spectate(game: ServerGame, player: ServerPlayer): ServerPlayerSpectator {
		const spectator = new ServerPlayerSpectator(game, player, this)
		this.spectators.push(spectator)
		return spectator
	}

	public removeSpectator(spectator: ServerPlayerSpectator): void {
		this.spectators = this.spectators.filter(player => player !== spectator)
	}

	static newInstance(playerDatabaseEntry: PlayerDatabaseEntry): ServerPlayer {
		return new ServerPlayer(playerDatabaseEntry.id, playerDatabaseEntry.email, playerDatabaseEntry.username)
	}
}
