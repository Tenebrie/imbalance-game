import Bash from '../services/BashService'
import pgMigrate from 'node-pg-migrate'
import { Client, QueryResult } from 'pg'

export default class Database {
	private static client: Client
	public static autonomousMode = false

	public static async init() {
		let databaseUrl = process.env.DATABASE_URL
		if (!databaseUrl) {
			console.info('Looking for database URL')
			try {
				const { stdout } = await Bash.exec('heroku pg:credentials:url HEROKU_POSTGRESQL_BRONZE --app notgwent')
				databaseUrl = stdout.split('\n').find(line => line.includes('postgres://')).trim()
			} catch (e) {
				console.error('[WARN] Unable to find database URL. Operating in autonomous mode')
				Database.autonomousMode = true
				return
			}
		}

		console.info('Connecting to database at "' + databaseUrl + '"')
		const client = new Client({
			connectionString: databaseUrl,
			ssl: true,
		})
		await client.connect()

		console.info('Connection established. Running migrations')
		await pgMigrate({
			count: 10000,
			dbClient: client,
			migrationsTable: 'MIGRATIONS',
			direction: 'up',
			dir: 'migrations',
			ignorePattern: ''
		})

		console.info('Database client ready')
		this.client = client
	}

	public static async insertRow(query: string): Promise<boolean> {
		try {
			await this.runQuery(query)
		} catch (err) {
			console.error(err)
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
