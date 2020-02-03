import RenderedCard from '@/Pixi/board/RenderedCard'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'

export default class ClientCardGraveyard {
	cards: CardMessage[]

	constructor(cards: CardMessage[]) {
		this.cards = cards
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public static fromMessage(message: CardDeckMessage): ClientCardGraveyard {
		return new ClientCardGraveyard(message.cards)
	}
}
