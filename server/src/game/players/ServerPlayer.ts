import * as ws from 'ws'
import PlayerWebSocket from './PlayerWebSocket'
import Player from '@shared/models/Player'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import ServerPlayerSpectator from './ServerPlayerSpectator'
import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from './ServerPlayerInGame'
import AccessLevel from '@shared/enums/AccessLevel'
import { ServerToClientJson } from '@shared/models/network/ServerToClientJson'

export default class ServerPlayer implements Player {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	webSocket: PlayerWebSocket | null
	spectators: ServerPlayerSpectator[]
	public timestampUpdatedAt: Date = new Date()

	constructor(id: string, email: string, username: string, accessLevel: AccessLevel) {
		this.id = id
		this.email = email
		this.username = username
		this.accessLevel = accessLevel
		this.webSocket = null
		this.spectators = []
	}

	public get game(): ServerGame | null {
		return this.webSocket?.game || null
	}

	public get playerInGame(): ServerPlayerInGame | null {
		return this.game?.players.find((playerInGame) => playerInGame.player === this) || null
	}

	registerConnection(ws: ws, game: ServerGame): void {
		this.webSocket = PlayerWebSocket.newInstance(ws, game)
	}

	sendMessage(json: ServerToClientJson): void {
		if (!this.webSocket) {
			return
		}
		this.webSocket.send(json)
		this.spectators.forEach((spectator) => spectator.player.sendMessage(json))
	}

	disconnect(): void {
		if (!this.webSocket) {
			return
		}

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
		this.spectators = this.spectators.filter((player) => player !== spectator)
	}

	static newInstance(playerDatabaseEntry: PlayerDatabaseEntry): ServerPlayer {
		return new ServerPlayer(
			playerDatabaseEntry.id,
			playerDatabaseEntry.email,
			playerDatabaseEntry.username,
			playerDatabaseEntry.accessLevel
		)
	}
}
