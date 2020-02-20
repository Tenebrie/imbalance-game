import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import CardDeck from '@/Pixi/shared/models/CardDeck'
import Card from '@/Pixi/shared/models/Card'

export default class ClientCardGraveyard implements CardDeck {
	unitCards: CardMessage[]
	spellCards: CardMessage[]

	constructor() {
		this.unitCards = []
		this.spellCards = []
	}

	public addUnit(card: CardMessage): void {
		this.unitCards.push(card)
	}

	public addSpell(card: CardMessage): void {
		this.spellCards.push(card)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.unitCards.find(card => card.id === cardId) || this.spellCards.find(card => card.id === cardId) || null
	}
}
