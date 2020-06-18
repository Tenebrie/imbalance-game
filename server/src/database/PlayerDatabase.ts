import uuidv4 from 'uuid/v4'
import Database from './Database'
import PlayerDatabaseEntry from '../types/PlayerDatabaseEntry'

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
	}
}
