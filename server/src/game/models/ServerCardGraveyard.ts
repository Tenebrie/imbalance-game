import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import ServerGame from './ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerCardGraveyard extends CardDeck {
	game: ServerGame
	owner: ServerPlayerInGame
	cards: ServerCard[]

	constructor(owner: ServerPlayerInGame) {
		super([])
		this.game = owner.game
		this.owner = owner
		this.cards = []
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}
}
