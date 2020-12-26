import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import OwnedRenderedCard from '@/Pixi/cards/OwnedRenderedCard'

type DiscardedResolveStackCard = {
	card: RenderedCard
	owner: ClientPlayerInGame
	index: number
}

export default class ClientCardResolveStack {
	cards: OwnedRenderedCard[]
	discardedCards: DiscardedResolveStackCard[]

	constructor() {
		this.cards = []
		this.discardedCards = []
	}

	public addCard(card: RenderedCard, owner: ClientPlayerInGame): void {
		this.cards.push({ card, owner })
	}

	public isEmpty(): boolean {
		return this.cards.length === 0
	}

	public findCardById(cardId: string): OwnedRenderedCard | null {
		return this.cards.find((ownedCard) => ownedCard.card.id === cardId) || null
	}

	public findDiscardedCardById(cardId: string): DiscardedResolveStackCard | null {
		return this.discardedCards.find((discardedCard) => discardedCard.card.id === cardId) || null
	}

	public discardCardById(cardId: string): void {
		const ownedCard = this.findCardById(cardId)
		if (!ownedCard) {
			return
		}

		const index = this.cards.indexOf(ownedCard)
		this.cards.splice(index, 1)
		setTimeout(() => {
			this.destroyCardById(cardId)
		}, 2000)

		this.discardedCards.push({
			...ownedCard,
			index: index,
		})
	}

	public destroyCardById(cardId: string): void {
		const discardedCard = this.findDiscardedCardById(cardId)
		if (!discardedCard) {
			return
		}

		this.discardedCards.splice(this.discardedCards.indexOf(discardedCard), 1)
		Core.destroyCard(discardedCard.card)
	}
}
