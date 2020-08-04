import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'

export default class ClientCardResolveStack {
	cards: RenderedCard[]

	constructor() {
		this.cards = []
	}

	public addCard(card: RenderedCard): void {
		this.cards.push(card)
	}

	public isEmpty(): boolean {
		return this.cards.length === 0
	}

	public findCardById(cardId: string): RenderedCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public destroyCardById(cardId: string): void {
		const card = this.findCardById(cardId)
		if (!card) { return }

		this.cards.splice(this.cards.indexOf(card), 1)
		Core.unregisterCard(card)
	}
}
