import RenderedCard from '@/Pixi/board/RenderedCard'
import CardHandMessage from '../shared/models/network/CardHandMessage'
import Utils from '@/utils/Utils'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import Core from '@/Pixi/Core'

export default class RenderedCardHand {
	cards: RenderedCard[]

	constructor(cards: RenderedCard[]) {
		this.cards = cards
	}

	public addCard(card: RenderedCard) {
		this.cards.push(card)
		this.cards.sort((a: RenderedCard, b: RenderedCard) => {
			return a.cardType - b.cardType || (b.unitSubtype ? b.unitSubtype : 10) - (a.unitSubtype ? a.unitSubtype : 10) || b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass)
		})
	}

	public getCardById(cardId: string): RenderedCard | null {
		return this.cards.find(renderedCard => renderedCard.id === cardId) || null
	}

	public reveal(data: CardMessage): void {
		const card = this.getCardById(data.id)
		if (!card) { return }

		const revealedCard = new RenderedCard(data)
		revealedCard.switchToCardMode()
		Core.registerCard(revealedCard)
		this.cards.splice(this.cards.indexOf(card), 1, revealedCard)
		Core.unregisterCard(card)
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
