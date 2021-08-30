import AccessLevel from '@shared/enums/AccessLevel'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import { JwtTokenScope } from '@src/enums/JwtTokenScope'
import GameLibrary from '@src/game/libraries/GameLibrary'
import { WebSocket } from '@src/game/players/WebSocket'
import { tryUntil } from '@src/utils/Utils'

import PlayerDatabase from '../../database/PlayerDatabase'
import HashManager from '../../services/HashService'
import TokenManager from '../../services/TokenService'
import ServerPlayer from './ServerPlayer'

const createNumberedUsername = (username: string): string => {
	let existingPlayer: PlayerDatabaseEntry | null
	let numberedUsername
	const isUsernameAvailable = tryUntil({
		try: async () => {
			const randomNumber = Math.floor(1000 + Math.random() * 9000)
			numberedUsername = `${username}#${randomNumber}`
			existingPlayer = await PlayerDatabase.selectPlayerByUsername(numberedUsername)
		},
		until: async () => {
			return !existingPlayer
		},
		maxAttempts: 10,
	})
	if (!isUsernameAvailable || !numberedUsername) {
		throw { status: 409, code: UserRegisterErrorCode.USERNAME_COLLISIONS, error: 'Username collision after 10 attempts' }
	}
	return numberedUsername
}

class PlayerLibrary {
	cachePrunedAt: number = new Date().getTime()
	playerCache: { player: ServerPlayer; timestamp: number }[]
	onlinePlayers: ServerPlayer[]

	constructor() {
		this.playerCache = []
		this.onlinePlayers = []
	}

	public async register(email: string, username: string, password: string): Promise<boolean> {
		email = email.toLowerCase()
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.insertPlayer(email, createNumberedUsername(username), passwordHash)
	}

	public async registerGuest(email: string, username: string): Promise<boolean> {
		email = email.toLowerCase()
		return PlayerDatabase.insertGuestPlayer(email, createNumberedUsername(username), '')
	}

	public async updateUsername(id: string, username: string): Promise<boolean> {
		const player = await this.getPlayerById(id)
		if (!player || player.isGuest) {
			return false
		}
		this.removeFromCache(player)
		return PlayerDatabase.updatePlayerUsername(id, createNumberedUsername(username))
	}

	public async updatePassword(id: string, password: string): Promise<boolean> {
		const player = await this.getPlayerById(id)
		if (!player || player.isGuest) {
			return false
		}
		this.removeFromCache(player)
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.updatePlayerPassword(id, passwordHash)
	}

	public async updateAccessLevel(id: string, accessLevel: AccessLevel): Promise<boolean> {
		const player = await this.getPlayerById(id)
		if (!player || player.isGuest) {
			return false
		}
		this.removeFromCache(player)
		return PlayerDatabase.updatePlayerAccessLevel(id, accessLevel)
	}

	public async login(email: string, password: string): Promise<ServerPlayer | null> {
		email = email.toLowerCase()
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerWithPasswordByEmail(email)

		if (!playerDatabaseEntry) {
			return null
		}

		const passwordsMatch = await HashManager.passwordsMatch(password, playerDatabaseEntry.passwordHash)
		if (!passwordsMatch) {
			return null
		}

		return this.cachePlayer(playerDatabaseEntry)
	}

	public async loginWithoutPassword(email: string): Promise<ServerPlayer | null> {
		email = email.toLowerCase()
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerByEmail(email)

		if (!playerDatabaseEntry) {
			return null
		}

		return this.cachePlayer(playerDatabaseEntry)
	}

	public async loginById(playerId: string): Promise<ServerPlayer | null> {
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(playerId)

		if (!playerDatabaseEntry) {
			return null
		}

		return this.cachePlayer(playerDatabaseEntry)
	}

	public async doesPlayerExist(username: string): Promise<boolean> {
		username = username.toLowerCase()
		return !!(await PlayerDatabase.selectPlayerByEmail(username))
	}

	private cachePlayer(playerDatabaseEntry: PlayerDatabaseEntry): ServerPlayer {
		const player = ServerPlayer.newInstance(playerDatabaseEntry)
		this.playerCache = this.playerCache.filter((cachedPlayer) => cachedPlayer.player.id !== player.id)
		this.playerCache.push({
			player,
			timestamp: new Date().getTime(),
		})
		PlayerLibrary.updateAccessedAt(player).then()
		return player
	}

	public removeFromCache(player: ServerPlayer): void {
		this.playerCache = this.playerCache.filter((cachedPlayer) => cachedPlayer.player.id !== player.id)
	}

	public async getPlayerById(playerId: string): Promise<ServerPlayer | null> {
		this.pruneCache()
		let cachedPlayer = this.playerCache.find((cachedPlayer) => cachedPlayer.player.id === playerId)
		if (!cachedPlayer) {
			const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(playerId)
			if (!playerDatabaseEntry) {
				return null
			}
			cachedPlayer = {
				player: ServerPlayer.newInstance(playerDatabaseEntry),
				timestamp: new Date().getTime(),
			}
			this.playerCache.push(cachedPlayer)
		}
		return cachedPlayer.player
	}

	public async getPlayerByJwtToken(token: string): Promise<ServerPlayer | null> {
		this.pruneCache()
		const tokenPayload = await TokenManager.verifyToken(token, [JwtTokenScope.AUTH])
		if (!tokenPayload) {
			return null
		}
		const player = await this.getPlayerById(tokenPayload.playerId)
		if (player) {
			PlayerLibrary.updateAccessedAt(player).then()
		}
		return player
	}

	public async deletePlayer(player: ServerPlayer): Promise<boolean> {
		return PlayerDatabase.deletePlayer(player.id)
	}

	public addOnlinePlayer(player: ServerPlayer): void {
		this.onlinePlayers.push(player)
	}

	public removeOnlinePlayer(player: ServerPlayer): void {
		this.onlinePlayers = this.onlinePlayers.filter((onlinePlayer) => onlinePlayer.id !== player.id)
	}

	private pruneCache(): void {
		const currentTime = new Date().getTime()
		if (currentTime - this.cachePrunedAt < 60000) {
			return
		}

		this.playerCache = this.playerCache.filter(
			(cachedPlayer) =>
				GameLibrary.games.some((game) =>
					game.players.flatMap((playerGroup) => playerGroup.players).find((playerInGame) => playerInGame.player === cachedPlayer.player)
				) || currentTime - cachedPlayer.timestamp < 60000
		)
		this.playerCache.filter((player) => player.player.isInGame()).forEach((player) => (player.timestamp = currentTime))
		this.cachePrunedAt = currentTime
	}

	private static async updateAccessedAt(player: ServerPlayer): Promise<void> {
		if (new Date().getTime() - player.timestampUpdatedAt.getTime() < 60000) {
			return
		}

		player.timestampUpdatedAt = new Date()
		await PlayerDatabase.updatePlayerAccessedAt(player.id)
	}
}

export default new PlayerLibrary()
