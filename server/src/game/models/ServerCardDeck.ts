import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import ServerGame from './ServerGame'
import CardLibrary from '../libraries/CardLibrary'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerOwnedCard from './ServerOwnedCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'

export default class ServerCardDeck extends CardDeck {
	game: ServerGame
	cards: ServerCard[]
	owner: ServerPlayerInGame

	constructor(game: ServerGame, owner: ServerPlayerInGame, cards: ServerCard[]) {
		super(cards)
		this.game = game
		this.owner = owner
		this.cards = cards
	}

	public instantiateFrom(deck: ServerTemplateCardDeck): void {
		deck.cards.forEach(card => this.addCard(CardLibrary.instantiate(card)))
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(): ServerCard {
		return this.cards.pop()
	}

	public findCardByClass(cardClass: string): ServerCard | null {
		return this.cards.find(card => card.cardClass === cardClass) || null
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public shuffle(): void {
		let counter = this.cards.length

		while (counter > 0) {
			const index = Math.floor(Math.random() * counter)
			counter--
			const temp = this.cards[counter]
			this.cards[counter] = this.cards[index]
			this.cards[index] = temp
		}
	}

	public removeCard(card: ServerCard): void {
		this.cards.splice(this.cards.indexOf(card), 1)

		OutgoingMessageHandlers.notifyAboutCardInDeckDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
