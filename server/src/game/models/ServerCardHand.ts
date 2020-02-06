import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerOwnedCard from './ServerOwnedCard'

export default class ServerCardHand {
	game: ServerGame
	cards: ServerCard[]
	owner: ServerPlayerInGame

	constructor(game: ServerGame, playerInGame: ServerPlayerInGame, cards: ServerCard[]) {
		this.game = game
		this.cards = cards
		this.owner = playerInGame
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(card: ServerCard): void {
		this.addCard(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public removeCard(card: ServerCard): void {
		this.cards.splice(this.cards.indexOf(card), 1)

		OutgoingMessageHandlers.notifyAboutCardInHandDestroyed(new ServerOwnedCard(card, this.owner))
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
