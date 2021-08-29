import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import CardDeck from '@shared/models/CardDeck'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { CardConstructor } from '../libraries/CardLibrary'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'

export default class ServerGraveyard implements CardDeck {
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

	public get allCards(): ServerCard[] {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public addCard(card: ServerCard): void {
		if (card.type === CardType.UNIT) {
			this.addUnit(card)
		} else if (card.type === CardType.SPELL) {
			this.addSpell(card)
		}
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToUnitGraveyard(this.owner, card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToSpellGraveyard(this.owner, card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find((card) => card.id === cardId) || this.spellCards.find((card) => card.id === cardId) || null
	}

	public findCardsByConstructor(prototype: CardConstructor): ServerCard[] {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.unitCards.filter((card) => card.class === cardClass).concat(this.spellCards.filter((card) => card.class === cardClass))
	}

	public findCardsByTribe(tribe: CardTribe): ServerCard[] {
		return this.unitCards.concat(this.spellCards).filter((card) => card.tribes.includes(tribe))
	}

	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInGraveyardDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
