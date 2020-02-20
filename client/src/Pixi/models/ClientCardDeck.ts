import RenderedCard from '@/Pixi/board/RenderedCard'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import CardDeck from '@/Pixi/shared/models/CardDeck'

export default class ClientCardDeck implements CardDeck {
	unitCards: CardMessage[]
	spellCards: CardMessage[]

	constructor(unitCards: CardMessage[], spellCards: CardMessage[]) {
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public drawUnitById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.unitCards.find(card => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.unitCards = this.unitCards.filter(card => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public drawSpellById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.spellCards.find(card => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.spellCards = this.spellCards.filter(card => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.unitCards.find(card => card.id === cardId) || this.spellCards.find(card => card.id === cardId) || null
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		return new ClientCardDeck(message.unitCards, message.spellCards)
	}
}
