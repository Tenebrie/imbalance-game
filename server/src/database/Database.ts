import Bash from '../services/BashService'
import pgMigrate from 'node-pg-migrate'
import { Client, QueryResult } from 'pg'

export default class Database {
	private static client: Client

	public static async init() {
		let databaseUrl = process.env.DATABASE_URL
		if (!databaseUrl) {
			console.info('[DB] Looking for database URL')
			const { stdout } = await Bash.exec('heroku pg:credentials:url HEROKU_POSTGRESQL_BRONZE --app lootcaster')
			databaseUrl = stdout.split('\n').find(line => line.includes('postgres://')).trim()
		}

		console.info('[DB] Connecting to database at "' + databaseUrl + '"')
		const client = new Client({
			connectionString: databaseUrl,
			ssl: true,
		})
		await client.connect()

		console.info('[DB] Connection established. Running migrations')
		await pgMigrate({
			count: 10000,
			dbClient: client,
			migrationsTable: 'MIGRATIONS',
			direction: 'up',
			dir: 'migrations',
			ignorePattern: ''
		})

		console.info('[DB] Database client ready')
		this.client = client
	}

	public static async insertRow(query: string): Promise<boolean> {
		try {
			await this.runQuery(query)
		} catch (err) {
			console.log(err)
			return false
		}

		return true
	}

	public static async selectRow<T>(query: string): Promise<T> {
		try {
			const result = await this.runQuery(query)
			if (!result.rows[0]) {
				return null
			}
			return result.rows[0]
		} catch (err) {
			return null
		}
	}

	public static async selectRows<T>(query: string): Promise<T[]> {
		try {
			const result = await this.runQuery(query)
			if (!result.rows) {
				return null
			}
			return result.rows
		} catch (err) {
			return null
		}
	}

	private static async runQuery(query: string): Promise<QueryResult> {
		if (!this.client) { throw 'Database client is not yet ready' }

		return new Promise((resolve, reject) => {
			this.client.query(query, (err, res) => {
				if (err) {
					reject(err)
					return
				}
				resolve(res)
			})
		})
	}
}
