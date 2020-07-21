import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardDeckMessage from '@shared/models/network/CardDeckMessage'
import CardMessage from '@shared/models/network/CardMessage'
import CardDeck from '@shared/models/CardDeck'
import Card from '@shared/models/Card'

export default class ClientCardDeck implements CardDeck {
	unitCardMessages: CardMessage[]
	spellCardMessages: CardMessage[]

	get unitCards(): Card[] {
		return []
	}

	get spellCards(): Card[] {
		return []
	}

	constructor(unitCards: CardMessage[], spellCards: CardMessage[]) {
		this.unitCardMessages = unitCards
		this.spellCardMessages = spellCards
	}

	public drawUnitById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.unitCardMessages.find(card => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.unitCardMessages = this.unitCardMessages.filter(card => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public drawSpellById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.spellCardMessages.find(card => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.spellCardMessages = this.spellCardMessages.filter(card => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.unitCardMessages.find(card => card.id === cardId) || this.spellCardMessages.find(card => card.id === cardId) || null
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		return new ClientCardDeck(message.unitCards, message.spellCards)
	}
}
