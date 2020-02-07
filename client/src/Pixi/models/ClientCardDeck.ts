import RenderedCard from '@/Pixi/board/RenderedCard'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'

export default class ClientCardDeck {
	cards: CardMessage[]

	constructor(cards: CardMessage[]) {
		this.cards = cards
	}

	public drawCardById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.cards.find(card => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.cards = this.cards.filter(card => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		return new ClientCardDeck(message.cards)
	}
}
