import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import ServerGame from './ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

export default class ServerCardGraveyard implements CardDeck {
	game: ServerGame
	owner: ServerPlayerInGame
	unitCards: ServerCard[]
	spellCards: ServerCard[]

	constructor(owner: ServerPlayerInGame) {
		this.game = owner.game
		this.owner = owner
		this.unitCards = []
		this.spellCards = []
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
		OutgoingMessageHandlers.notifyAboutUnitCardInGraveyard(this.owner, card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutSpellCardInGraveyard(this.owner, card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find(card => card.id === cardId) || this.spellCards.find(card => card.id === cardId) || null
	}
}
