import pgMigrate from 'node-pg-migrate'
import { Client, QueryResult } from 'pg'
import { colorize } from '../utils/Utils'
import AsciiColor from '../enums/AsciiColor'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'

class Database {
	private client: Client | undefined

	public isReady(): boolean {
		return !!this.client
	}

	constructor() {
		this.init().then()
	}

	public async init(): Promise<void> {
		const databaseUrl = process.env.DATABASE_URL || ''
		if (!databaseUrl) {
			return
		}

		console.info(`Connecting to database at ${colorize(databaseUrl, AsciiColor.CYAN)}`)
		const client = new Client({
			connectionString: databaseUrl,
			ssl: databaseUrl.includes('dev-db')
				? false
				: {
						rejectUnauthorized: false,
				  },
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
				ignorePattern: '',
			})

			console.info('Database client ready')
			this.client = client
			GameHistoryDatabase.closeAbandonedGames().then()
		} catch (e) {
			console.error('[ERROR] Unable to connect to database!', e)
		}
	}

	public async insertRow(query: string, values: any[] = []): Promise<boolean> {
		try {
			await this.runQuery(query, values)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}

	public async selectRow<T>(query: string, values: any[] = []): Promise<T | null> {
		try {
			const result = await this.runQuery(query, values)
			if (!result.rows[0]) {
				return null
			}
			return result.rows[0]
		} catch (err) {
			console.error(err)
			return null
		}
	}

	public async selectRows<T>(query: string, values: any[] = []): Promise<T[] | null> {
		try {
			const result = await this.runQuery(query, values)
			if (!result.rows) {
				return []
			}
			return result.rows
		} catch (err) {
			console.error(err)
			return null
		}
	}

	public async updateRows(query: string, values: any[] = []): Promise<boolean> {
		try {
			await this.runQuery(query, values)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}

	public async deleteRows(query: string, values: any[] = []): Promise<boolean> {
		try {
			await this.runQuery(query, values)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}

	private async runQuery(query: string, values: any[]): Promise<QueryResult> {
		if (!this.client) {
			throw { status: 503, message: 'Database client is not yet ready' }
		}

		return new Promise((resolve, reject) => {
			if (!this.client) {
				reject(new Error('Client is not defined'))
				return
			}

			this.client.query(
				{
					text: query,
					values: values,
				},
				(err, res) => {
					if (err) {
						reject(err)
						return
					}
					resolve(res)
				}
			)
		})
	}
}

export default new Database()
