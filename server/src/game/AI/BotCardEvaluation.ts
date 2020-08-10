import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'

export default class BotCardEvaluation {
	game: ServerGame
	card: ServerCard

	constructor(card: ServerCard) {
		this.game = card.game
		this.card = card
	}

	public get expectedValue(): number {
		return this.card.power
	}
}
