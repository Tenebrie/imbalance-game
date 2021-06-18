import Database from './Database'
import Language from '@shared/enums/Language'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import RenderQuality from '@shared/enums/RenderQuality'
import AccessLevel from '@shared/enums/AccessLevel'
import { createRandomPlayerId } from '@src/utils/Utils'

export default {
	async insertPlayer(email: string, username: string, passwordHash: string): Promise<boolean> {
		const playerId = createRandomPlayerId()
		const query = `INSERT INTO players (id, email, username, "passwordHash", "isGuest") VALUES($1, $2, $3, $4, $5);`
		return Database.insertRow(query, [playerId, email, username, passwordHash, false])
	},

	async insertGuestPlayer(email: string, username: string, passwordHash: string): Promise<boolean> {
		const playerId = createRandomPlayerId()
		const query = `INSERT INTO players (id, email, username, "passwordHash", "isGuest") VALUES($1, $2, $3, $4, $5);`
		return Database.insertRow(query, [playerId, email, username, passwordHash, true])
	},

	async selectPlayerById(id: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE id = $1`
		return Database.selectRow<PlayerDatabaseEntry>(query, [id])
	},

	async selectPlayerByEmail(email: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE email = $1`
		return Database.selectRow<PlayerDatabaseEntry>(query, [email])
	},

	async selectPlayerWithPasswordByEmail(email: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT * FROM players WHERE email = $1`
		return Database.selectRow<PlayerDatabaseEntry>(query, [email])
	},

	async selectPlayerByUsername(username: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE username = $1`
		return Database.selectRow<PlayerDatabaseEntry>(query, [username])
	},

	async selectAllPlayers(): Promise<PlayerDatabaseEntry[] | null> {
		const query = 'SELECT *, \'[Redacted]\' as "passwordHash" FROM players ORDER BY players."accessedAt" DESC LIMIT 500'
		return Database.selectRows<PlayerDatabaseEntry>(query)
	},

	async updatePlayerUsername(id: string, username: string): Promise<boolean> {
		const query = `UPDATE players SET username = $2 WHERE id = $1`
		return Database.updateRows(query, [id, username])
	},

	async updatePlayerPassword(id: string, passwordHash: string): Promise<boolean> {
		const query = `UPDATE players SET "passwordHash" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, passwordHash])
	},

	async updatePlayerAccessLevel(id: string, accessLevel: AccessLevel): Promise<boolean> {
		const query = `UPDATE players SET "accessLevel" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, accessLevel])
	},

	async updatePlayerUserLanguage(id: string, userLanguage: Language): Promise<boolean> {
		const query = `UPDATE players SET "userLanguage" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, userLanguage])
	},

	async updatePlayerRenderQuality(id: string, renderQuality: RenderQuality): Promise<boolean> {
		const query = `UPDATE players SET "renderQuality" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, renderQuality])
	},

	async updatePlayerMasterVolume(id: string, masterVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "masterVolume" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, masterVolume])
	},

	async updatePlayerMusicVolume(id: string, musicVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "musicVolume" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, musicVolume])
	},

	async updatePlayerEffectsVolume(id: string, effectsVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "effectsVolume" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, effectsVolume])
	},

	async updatePlayerAmbienceVolume(id: string, ambienceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "ambienceVolume" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, ambienceVolume])
	},

	async updatePlayerUserInterfaceVolume(id: string, userInterfaceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "userInterfaceVolume" = $2 WHERE id = $1`
		return Database.updateRows(query, [id, userInterfaceVolume])
	},

	async updatePlayerWelcomeModalSeenAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "welcomeModalSeenAt" = current_timestamp WHERE id = $1`
		return Database.updateRows(query, [id])
	},

	async updatePlayerMobileModalSeenAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "mobileModalSeenAt" = current_timestamp WHERE id = $1`
		return Database.updateRows(query, [id])
	},

	async updatePlayerAccessedAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "accessedAt" = current_timestamp WHERE id = $1`
		return Database.updateRows(query, [id])
	},

	async deletePlayer(id: string): Promise<boolean> {
		const firstQuery = `
			UPDATE game_history SET "victoriousPlayer"=null WHERE "victoriousPlayer"=$1;
		`
		const secondQuery = `
			DELETE FROM players WHERE id = $1;
		`
		return (await Database.updateRows(firstQuery, [id])) && (await Database.deleteRows(secondQuery, [id]))
	},

	async deleteAllGuestPlayers(): Promise<boolean> {
		const query = 'SELECT * FROM players WHERE "isGuest"=TRUE'
		const allGuestPlayers = await Database.selectRows<PlayerDatabaseEntry>(query)
		if (allGuestPlayers === null) {
			return false
		}
		if (allGuestPlayers.length === 0) {
			return true
		}
		console.info(`Clearing out ${allGuestPlayers.length} guest player accounts...`)

		const firstQuery = `
			UPDATE game_history SET "victoriousPlayer"=null WHERE "victoriousPlayer"=$1;
		`
		const promises = allGuestPlayers.map((player) => Database.updateRows(firstQuery, [player.id]))
		await Promise.all(promises)
		return Database.deleteRows(`DELETE FROM players WHERE "isGuest"=TRUE`)
	},
}
