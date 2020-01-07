import ServerCard from './ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayer from '../../libraries/players/ServerPlayer'

export default class ServerCardHand {
	cards: ServerCard[]
	player: ServerPlayer

	constructor(player: ServerPlayer, cards: ServerCard[]) {
		this.cards = cards
		this.player = player
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(card: ServerCard, game: ServerGame): void {
		this.addCard(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public removeCard(card: ServerCard): void {
		this.cards.splice(this.cards.indexOf(card), 1)
	}

	public getRandomCard(): ServerCard | null {
		if (this.isEmpty()) { return null }

		return this.cards[Math.floor(Math.random() * this.cards.length)]
	}

	public isEmpty(): boolean {
		return this.cards.length === 0
	}

	public removeCardById(cardId: string) {
		const card = this.cards.find(card => card.id === cardId)
		if (!card) { return }

		this.removeCard(card)
	}
}
