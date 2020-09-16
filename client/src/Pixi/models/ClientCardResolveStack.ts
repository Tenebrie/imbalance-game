import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import OwnedRenderedCard from '@/Pixi/cards/OwnedRenderedCard'
import store from '@/Vue/store'

export default class ClientCardResolveStack {
	cards: OwnedRenderedCard[]

	constructor() {
		this.cards = []
	}

	public addCard(card: RenderedCard, owner: ClientPlayerInGame): void {
		this.cards.push({ card, owner })
		store.commit.gameStateModule.setResolveStackCardsLength(this.cards.length)
	}

	public isEmpty(): boolean {
		return this.cards.length === 0
	}

	public findCardById(cardId: string): OwnedRenderedCard | null {
		return this.cards.find(ownedCard => ownedCard.card.id === cardId) || null
	}

	public destroyCardById(cardId: string): void {
		const ownedCard = this.findCardById(cardId)
		if (!ownedCard) { return }

		this.cards.splice(this.cards.indexOf(ownedCard), 1)
		store.commit.gameStateModule.setResolveStackCardsLength(this.cards.length)
		Core.unregisterCard(ownedCard.card)
	}
}
