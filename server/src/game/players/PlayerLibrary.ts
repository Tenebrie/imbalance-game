import ServerPlayer from './ServerPlayer'
import HashManager from '../../services/HashService'
import TokenManager from '../../services/TokenService'
import { JwtTokenScope } from '../../enums/JwtTokenScope'
import PlayerDatabase from '../../database/PlayerDatabase'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import {tryUntil} from '../../utils/Utils'
import UserRegisterErrorCode from '@shared/enums/UserRegisterErrorCode'

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
		maxAttempts: 10
	})
	if (!isUsernameAvailable || !numberedUsername) {
		throw { status: 409, code: UserRegisterErrorCode.USERNAME_COLLISIONS, error: 'Username collision after 10 attempts' }
	}
	return numberedUsername
}

class PlayerLibrary {
	players: Array<ServerPlayer>

	constructor() {
		this.players = []
	}

	public async register(email: string, username: string, password: string): Promise<boolean> {
		email = email.toLowerCase()
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.insertPlayer(email, createNumberedUsername(username), passwordHash)
	}

	public async updateUsername(id: string, username: string): Promise<boolean> {
		const player = await this.getPlayerById(id)
		if (!player) {
			return false
		}
		this.removeFromCache(player)
		return PlayerDatabase.updatePlayerUsername(id, createNumberedUsername(username))
	}

	public async updatePassword(id: string, password: string): Promise<boolean> {
		const player = await this.getPlayerById(id)
		if (!player) {
			return false
		}
		this.removeFromCache(player)
		const passwordHash = await HashManager.hashPassword(password)
		return PlayerDatabase.updatePlayerPassword(id, passwordHash)
	}

	public async login(email: string, password: string): Promise<ServerPlayer | null> {
		email = email.toLowerCase()
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerByEmail(email)

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

	public async getPlayerById(playerId: string): Promise<ServerPlayer | null> {
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

	public async getPlayerByJwtToken(token: string): Promise<ServerPlayer | null> {
		const tokenPayload = await TokenManager.verifyToken(token, [JwtTokenScope.AUTH])
		if (!tokenPayload) {
			return null
		}
		return this.getPlayerById(tokenPayload.playerId)
	}

	public async getAllPlayers(): Promise<ServerPlayer[] | null> {
		const result = await PlayerDatabase.selectAllPlayers()
		if (!result) {
			return null
		}
		return result.map(entry => ServerPlayer.newInstance(entry))
	}

	public async deletePlayer(player: ServerPlayer): Promise<boolean> {
		return PlayerDatabase.deletePlayer(player.id)
	}
}

export default new PlayerLibrary()
