import Card from '@shared/models/Card'
import CardDeck from '@shared/models/CardDeck'
import CardMessage from '@shared/models/network/card/CardMessage'
import CardDeckMessage from '@shared/models/network/cardDeck/CardDeckMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'

export default class ClientCardDeck implements CardDeck {
	unitCardMessages: CardMessage[]
	spellCardMessages: CardMessage[]

	get unitCards(): Card[] {
		return []
	}

	get spellCards(): Card[] {
		return []
	}

	public get allCards(): CardMessage[] {
		return this.unitCardMessages.slice().concat(this.spellCardMessages)
	}

	constructor(unitCards: CardMessage[], spellCards: CardMessage[]) {
		this.unitCardMessages = unitCards
		this.spellCardMessages = spellCards
	}

	public addUnit(card: CardMessage): void {
		this.unitCardMessages.push(card)
	}

	public addSpell(card: CardMessage): void {
		this.spellCardMessages.push(card)
	}

	public drawUnitById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.unitCardMessages.find((card) => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.unitCardMessages = this.unitCardMessages.filter((card) => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public drawSpellById(cardId: string): RenderedCard | null {
		const drawnCardMessage = this.spellCardMessages.find((card) => card.id === cardId)
		if (!drawnCardMessage) {
			return null
		}
		this.spellCardMessages = this.spellCardMessages.filter((card) => card !== drawnCardMessage)
		return RenderedCard.fromMessage(drawnCardMessage)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.unitCardMessages.find((card) => card.id === cardId) || this.spellCardMessages.find((card) => card.id === cardId) || null
	}

	public destroyCardById(cardId: string): void {
		this.unitCardMessages = this.unitCardMessages.filter((card) => card.id !== cardId)
		this.spellCardMessages = this.spellCardMessages.filter((card) => card.id !== cardId)
	}

	public static fromMessage(message: CardDeckMessage): ClientCardDeck {
		return new ClientCardDeck(message.unitCards, message.spellCards)
	}
}
