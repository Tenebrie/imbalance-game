import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import ServerGame from './ServerGame'
import CardLibrary from '../libraries/CardLibrary'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerOwnedCard from './ServerOwnedCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'
import Utils from '../../utils/Utils'

export default class ServerDeck implements CardDeck {
	unitCards: ServerCard[]
	spellCards: ServerCard[]
	owner: ServerPlayerInGame
	game: ServerGame

	constructor(game: ServerGame, owner: ServerPlayerInGame, unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.game = game
		this.owner = owner
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public instantiateFrom(deck: ServerTemplateCardDeck): void {
		deck.unitCards.forEach(card => this.addUnit(CardLibrary.instantiate(card)))
		deck.spellCards.forEach(card => this.addSpell(CardLibrary.instantiate(card)))
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
	}

	public drawUnit(): ServerCard {
		return this.unitCards.pop()
	}

	public drawSpell(): ServerCard {
		return this.spellCards.pop()
	}

	public findCardByClass(cardClass: string): ServerCard | null {
		return this.unitCards.find(card => card.class === cardClass) || this.spellCards.find(card => card.class === cardClass) || null
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find(card => card.id === cardId) || this.spellCards.find(card => card.id === cardId) || null
	}

	public shuffle(): void {
		this.unitCards = Utils.shuffle(this.unitCards)
		this.spellCards = Utils.shuffle(this.spellCards)
	}

	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter(unitCard => unitCard !== card)
		this.spellCards = this.spellCards.filter(unitCard => unitCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInDeckDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
