import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

type ActiveResolutionStackCard = {
	card: RenderedCard
	owner: ClientPlayerInGame
	protected: boolean
}

type DiscardedResolutionStackCard = {
	card: RenderedCard
	owner: ClientPlayerInGame
	index: number
	timeout: number
}

export default class ClientCardResolveStack {
	cards: ActiveResolutionStackCard[]
	discardedCards: DiscardedResolutionStackCard[]

	constructor() {
		this.cards = []
		this.discardedCards = []
	}

	public addCard(card: RenderedCard, owner: ClientPlayerInGame): void {
		this.cards.push({ card, owner, protected: false })
	}

	public isEmpty(): boolean {
		return this.cards.length === 0
	}

	public findCardById(cardId: string): ActiveResolutionStackCard | null {
		return this.cards.find((ownedCard) => ownedCard.card.id === cardId) || null
	}

	public findDiscardedCardById(cardId: string): DiscardedResolutionStackCard | null {
		return this.discardedCards.find((discardedCard) => discardedCard.card.id === cardId) || null
	}

	public discardCardById(cardId: string): void {
		const ownedCard = this.findCardById(cardId)
		if (!ownedCard) {
			return
		}

		if (ownedCard.protected) {
			ownedCard.protected = false
			return
		}

		const index = this.cards.indexOf(ownedCard)
		this.cards.splice(index, 1)
		const timeout = setTimeout(() => {
			this.destroyCardById(cardId)
		}, 2000)

		this.discardedCards.push({
			...ownedCard,
			index: index,
			timeout,
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
