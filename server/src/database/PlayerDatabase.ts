import uuidv4 from 'uuid/v4'
import Database from './Database'
import Language from '@shared/models/Language'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import RenderQuality from '@shared/enums/RenderQuality'

export default {
	async insertPlayer(email: string, username: string, passwordHash: string): Promise<boolean> {
		const playerId = uuidv4()
		const query = `INSERT INTO players (id, email, username, "passwordHash") VALUES('${playerId}', '${email}', '${username}', '${passwordHash}');`
		return Database.insertRow(query)
	},

	async selectPlayerById(id: string): Promise<PlayerDatabaseEntry> {
		const query = `SELECT * FROM players WHERE id = '${id}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerByEmail(email: string): Promise<PlayerDatabaseEntry> {
		const query = `SELECT * FROM players WHERE email = '${email}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerByUsername(username: string): Promise<PlayerDatabaseEntry> {
		const query = `SELECT * FROM players WHERE username = '${username}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async updatePlayerPassword(id: string, passwordHash: string): Promise<boolean> {
		const query = `UPDATE players SET "passwordHash" = '${passwordHash}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerUserLanguage(id: string, userLanguage: Language): Promise<boolean> {
		const query = `UPDATE players SET "userLanguage" = '${userLanguage}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerRenderQuality(id: string, renderQuality: RenderQuality): Promise<boolean> {
		const query = `UPDATE players SET "renderQuality" = '${renderQuality}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerMasterVolume(id: string, masterVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "masterVolume" = '${masterVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerMusicVolume(id: string, musicVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "musicVolume" = '${musicVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerEffectsVolume(id: string, effectsVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "effectsVolume" = '${effectsVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerAmbienceVolume(id: string, ambienceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "ambienceVolume" = '${ambienceVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerUserInterfaceVolume(id: string, userInterfaceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "userInterfaceVolume" = '${userInterfaceVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async deletePlayer(id: string): Promise<boolean> {
		const query = `DELETE FROM players WHERE id = '${id}'`
		return Database.deleteRows(query)
	}
}
