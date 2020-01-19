import RenderedCard from '@/Pixi/models/RenderedCard'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'

export default class ClientCardDeck {
	cards: RenderedCard[]

	constructor(cards: RenderedCard[]) {
		this.cards = cards
	}

	public drawCardById(cardId: string): RenderedCard | null {
		const drawnCard = this.cards.find(card => card.id === cardId)
		if (!drawnCard) {
			return null
		}
		this.cards = this.cards.filter(card => card !== drawnCard)
		return drawnCard
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		const cards = message.cards.map(cardMessage => RenderedCard.fromMessage(cardMessage))
		return new ClientCardDeck(cards)
	}
}
