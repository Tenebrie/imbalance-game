import pgMigrate from 'node-pg-migrate'
import { Client, QueryResult } from 'pg'

class Database {
	private client: Client

	public isReady(): boolean {
		return !!this.client
	}

	constructor() {
		this.init()
	}

	public async init(): Promise<void> {
		const databaseUrl = process.env.DATABASE_URL

		console.info('Connecting to database at "' + databaseUrl + '"')
		const client = new Client({
			connectionString: databaseUrl,
			ssl: !databaseUrl.includes('dev-db'),
		})
		try {
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
		} catch (e) {
			console.error('[ERROR] Unable to connect to database!', e)
		}
	}

	public async insertRow(query: string): Promise<boolean> {
		try {
			await this.runQuery(query)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}

	public async selectRow<T>(query: string): Promise<T> {
		try {
			const result = await this.runQuery(query)
			if (!result.rows[0]) {
				return null
			}
			return result.rows[0]
		} catch (err) {
			console.error(err)
			return null
		}
	}

	public async selectRows<T>(query: string): Promise<T[]> {
		try {
			const result = await this.runQuery(query)
			if (!result.rows) {
				return []
			}
			return result.rows
		} catch (err) {
			console.error(err)
			return null
		}
	}

	public async deleteRows(query: string): Promise<boolean> {
		try {
			await this.runQuery(query)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}

	private async runQuery(query: string): Promise<QueryResult> {
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

export default new Database()
