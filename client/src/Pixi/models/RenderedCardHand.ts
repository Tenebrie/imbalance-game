import RenderedCard from '@/Pixi/models/RenderedCard'
import CardHandMessage from '../../shared/models/network/CardHandMessage'

export default class RenderedCardHand {
	cards: RenderedCard[]

	constructor(cards: RenderedCard[]) {
		this.cards = cards
	}

	public addCard(card: RenderedCard) {
		this.cards.push(card)
	}

	public getCardById(cardId: string): RenderedCard | null {
		return this.cards.find(renderedCard => renderedCard.id === cardId) || null
	}

	public removeCard(card: RenderedCard) {
		this.cards.splice(this.cards.indexOf(card), 1)
		card.unregister()
	}

	public removeCardById(cardId: string) {
		const card = this.cards.find(card => card.id === cardId)
		if (!card) { return }
		this.removeCard(card)
	}

	public static fromMessage(message: CardHandMessage): RenderedCardHand {
		const cards = message.cards.map(cardMessage => RenderedCard.fromMessage(cardMessage))
		return new RenderedCardHand(cards)
	}
}
