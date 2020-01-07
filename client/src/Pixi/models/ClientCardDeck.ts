import Card from '@/shared/models/Card'
import CardDeckMessage from '@/shared/models/network/CardDeckMessage'

export default class ClientCardDeck {
	cards: Card[]

	constructor(cards: Card[]) {
		this.cards = cards
	}

	public drawCardById(cardId: string): Card | null {
		const drawnCard = this.cards.find(card => card.id === cardId)
		if (!drawnCard) {
			return null
		}
		this.cards = this.cards.filter(card => card !== drawnCard)
		return drawnCard
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new ClientCardDeck(cards)
	}
}
