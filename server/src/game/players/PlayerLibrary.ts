import ServerPlayer from './ServerPlayer'
import HashManager from '../../services/HashService'
import TokenManager from '../../services/TokenService'
import { JwtTokenScope } from '../../enums/JwtTokenScope'
import PlayerDatabase from '../../database/PlayerDatabase'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'

class PlayerLibrary {
	players: Array<ServerPlayer>

	constructor() {
		this.players = []
	}

	public async register(email: string, username: string, password: string): Promise<boolean> {
		// username = username.toLowerCase()
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.insertPlayer(email, username, passwordHash)
	}

	public async updatePassword(id: string, password: string): Promise<boolean> {
		const player = await this.getPlayerById(id)
		this.removeFromCache(player)
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.updatePlayerPassword(id, passwordHash)
	}

	public async login(username: string, password: string): Promise<ServerPlayer> {
		username = username.toLowerCase()
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerByEmail(username)

		if (!playerDatabaseEntry) {
			return null
		}

		const passwordsMatch = await HashManager.passwordsMatch(password, playerDatabaseEntry.passwordHash)
		if (!passwordsMatch) {
			return null
		}

		return this.cachePlayer(playerDatabaseEntry)
	}

	public async loginWithoutPassword(username: string): Promise<ServerPlayer> {
		username = username.toLowerCase()
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerByEmail(username)

		if (!playerDatabaseEntry) {
			return null
		}

		return this.cachePlayer(playerDatabaseEntry)
	}

	public async doesPlayerExist(username: string): Promise<boolean> {
		username = username.toLowerCase()
		return !!await PlayerDatabase.selectPlayerByEmail(username)
	}

	private cachePlayer(playerDatabaseEntry: PlayerDatabaseEntry): ServerPlayer {
		const player = ServerPlayer.newInstance(playerDatabaseEntry)
		this.players.push(player)
		return player
	}

	public removeFromCache(player: ServerPlayer): void {
		this.players = this.players.filter(playerInCache => playerInCache.id !== player.id)
	}

	public async getPlayerById(playerId: string): Promise<ServerPlayer> {
		let player = this.players.find(player => player.id === playerId)
		if (!player) {
			const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(playerId)
			if (!playerDatabaseEntry) {
				return null
			}
			player = ServerPlayer.newInstance(playerDatabaseEntry)
			this.players.push(player)
		}
		return player
	}

	public async getPlayerByJwtToken(token: string): Promise<ServerPlayer> {
		const tokenPayload = await TokenManager.verifyToken(token, [JwtTokenScope.AUTH])
		if (!tokenPayload) {
			return null
		}
		return this.getPlayerById(tokenPayload.playerId)
	}

	public async deletePlayer(player: ServerPlayer): Promise<boolean> {
		return PlayerDatabase.deletePlayer(player.id)
	}
}

export default new PlayerLibrary()
