import uuidv4 from 'uuid/v4'
import Database from './Database'

export default {
	async insertPlayer(username: string, passwordHash: string): Promise<boolean> {
		const playerId = uuidv4()
		const query = `INSERT INTO players (id, username, "passwordHash") VALUES('${playerId}', '${username}', '${passwordHash}');`
		return Database.insertRow(query)
	},

	async selectPlayerById(id: string): Promise<PlayerDatabaseEntry> {
		const query = `SELECT * FROM players WHERE id = '${id}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerByUsername(username: string): Promise<PlayerDatabaseEntry> {
		const query = `SELECT * FROM players WHERE username = '${username}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	}
}
