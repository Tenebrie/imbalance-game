import { OvermindInputBoardCardMessage } from '@shared/models/overmind/OvermindInputBoardCardMessage'
import { OvermindInputHandCardMessage } from '@shared/models/overmind/OvermindInputHandCardMessage'
import ServerCard from '@src/game/models/ServerCard'
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

	public async post<T>(url: string, data: Record<string, any>): Promise<T> {
		const response = await axios.post(`${this.baseUrl}${url}`, data)
		return response.data as T
	}
}

class OvermindHttpClient extends HttpClient {
	constructor() {
		super('http://8ef6-84-248-103-130.eu.ngrok.io')
	}

	public async getMove(
		agentId: string,
		data: {
			playableCards: ServerCard[]
			allCardsInHand: ServerCard[]
			alliedUnits: (ServerCard | null)[]
			enemyUnits: (ServerCard | null)[]
		}
	): Promise<string> {
		const playableCards = data.playableCards.map((card) => card.id)
		const allCardsInHand = data.allCardsInHand.map((card) => new OvermindInputHandCardMessage(card).stupify())
		const alliedUnits = data.alliedUnits.map((card) => new OvermindInputBoardCardMessage(card).stupify())
		const enemyUnits = data.enemyUnits.map((card) => new OvermindInputBoardCardMessage(card).stupify())

		return this.post<string>(`/move/${agentId}`, {
			playableCards,
			allCardsInHand,
			alliedUnits,
			enemyUnits,
		})
	}
}

export default new OvermindHttpClient()
