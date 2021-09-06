import AccessLevel from '@shared/enums/AccessLevel'
import { ServerToClientWebJson } from '@shared/models/network/messageHandlers/WebMessageTypes'
import { ServerToClientJson } from '@shared/models/network/ServerToClientJson'
import Player from '@shared/models/Player'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import PlayerLibrary from '@src/game/players/PlayerLibrary'
import * as ws from 'ws'

import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from './ServerPlayerInGame'
import ServerPlayerSpectator from './ServerPlayerSpectator'
import { GameWebSocket, WebSocket } from './WebSocket'

export default class ServerPlayer implements Player {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	isGuest: boolean

	globalWebSockets: WebSocket[]
	gameWebSocket: GameWebSocket | null
	spectators: ServerPlayerSpectator[]
	public timestampUpdatedAt: Date = new Date()

	constructor(id: string, email: string, username: string, accessLevel: AccessLevel, isGuest: boolean) {
		this.id = id
		this.email = email
		this.username = username
		this.accessLevel = accessLevel
		this.isGuest = isGuest
		this.globalWebSockets = []
		this.gameWebSocket = null
		this.spectators = []
	}

	public get game(): ServerGame | null {
		return this.gameWebSocket?.game || null
	}

	public get playerInGame(): ServerPlayerInGame | null {
		return this.game?.players.flatMap((playerGroup) => playerGroup.players).find((playerInGame) => playerInGame.player === this) || null
	}

	registerGlobalConnection(ws: ws, id: string): void {
		this.globalWebSockets.push(new WebSocket(ws, id))
		PlayerLibrary.addOnlinePlayer(this)
	}

	registerGameConnection(ws: ws, game: ServerGame): void {
		this.gameWebSocket = new GameWebSocket(ws, game)
	}

	sendGlobalMessage(json: ServerToClientWebJson): void {
		this.globalWebSockets.forEach((socket) => socket.send(json))
	}

	sendGameMessage(json: ServerToClientJson): void {
		if (!this.gameWebSocket) {
			return
		}
		this.gameWebSocket.send(json)
		this.spectators.forEach((spectator) => spectator.player.sendGameMessage(json))
	}

	disconnectGlobalSocket(id: string): void {
		const sockets = this.globalWebSockets.filter((socket) => socket.id === id)
		sockets.forEach((socket) => {
			socket.close()
		})
		this.globalWebSockets = this.globalWebSockets.filter((socket) => socket.id !== id)
		PlayerLibrary.removeOnlinePlayer(this)
	}

	disconnectGameSocket(): void {
		if (!this.gameWebSocket) {
			return
		}

		this.gameWebSocket.close()
		this.gameWebSocket = null
	}

	isOnline(): boolean {
		return this.globalWebSockets.length > 0
	}

	isInGame(): boolean {
		return !!this.gameWebSocket
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
			playerDatabaseEntry.accessLevel,
			playerDatabaseEntry.isGuest
		)
	}
}
