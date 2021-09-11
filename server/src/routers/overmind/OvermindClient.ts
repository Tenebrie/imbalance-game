import CardMessage from '@shared/models/network/card/CardMessage'
import axios from 'axios'

class HttpClient {
	private readonly baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	public async get<T>(url: string): Promise<T> {
		const response = await axios.get(`${this.baseUrl}${url}`)
		return response.data as T
	}
}

class OvermindHttpClient extends HttpClient {
	constructor() {
		super('http://localhost:3000')
	}

	public async getCards(): Promise<CardMessage[]> {
		return await this.get<CardMessage[]>('/api/cards')
	}
}

export default new OvermindHttpClient()
