import CardMessage from '@shared/models/network/CardMessage'
import CardDeck from '@shared/models/CardDeck'
import Card from '@shared/models/Card'

export default class ClientCardGraveyard implements CardDeck {
	unitCardMessages: CardMessage[]
	spellCardMessages: CardMessage[]

	get unitCards(): Card[] {
		return []
	}

	get spellCards(): Card[] {
		return []
	}

	constructor() {
		this.unitCardMessages = []
		this.spellCardMessages = []
	}

	public addUnit(card: CardMessage): void {
		this.unitCardMessages.push(card)
	}

	public addSpell(card: CardMessage): void {
		this.spellCardMessages.push(card)
	}

	public findCardById(cardId: string): CardMessage | null {
		return this.unitCardMessages.find(card => card.id === cardId) || this.spellCardMessages.find(card => card.id === cardId) || null
	}
}
