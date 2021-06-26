import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import ServerGame from './ServerGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerOwnedCard from './ServerOwnedCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'
import { getClassFromConstructor, shuffle } from '@src/utils/Utils'
import { CardConstructor } from '@src/game/libraries/CardLibrary'

export default class ServerDeck implements CardDeck {
	game: ServerGame
	owner: ServerPlayerInGame
	unitCards: ServerCard[]
	spellCards: ServerCard[]

	constructor(game: ServerGame, owner: ServerPlayerInGame, unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.game = game
		this.owner = owner
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public get allCards(): ServerCard[] {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public get hasDuplicates(): boolean {
		return !!this.unitCards.find((outerCard) =>
			this.unitCards.find((innerCard) => outerCard !== innerCard && outerCard.class === innerCard.class)
		)
	}

	public getCardIndex(card: ServerCard): number {
		const unitIndex = this.unitCards.indexOf(card)
		const spellIndex = this.spellCards.indexOf(card)
		return unitIndex >= 0 ? unitIndex : spellIndex
	}

	public instantiateFrom(deck: ServerTemplateCardDeck): void {
		deck.unitCards.forEach((card) => this.addUnitToTop(card))
		deck.spellCards.forEach((card) => this.addSpellToTop(card))
	}

	public addUnitToTop(card: ServerCard): void {
		this.unitCards.unshift(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToUnitDeck(this.owner, card)
	}

	public addSpellToTop(card: ServerCard): void {
		this.spellCards.unshift(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToSpellDeck(this.owner, card)
	}

	public addUnitToBottom(card: ServerCard): void {
		this.unitCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToUnitDeck(this.owner, card)
	}

	public addSpellToBottom(card: ServerCard): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToSpellDeck(this.owner, card)
	}

	public drawTopUnit(): ServerCard | null {
		if (this.unitCards.length === 0) {
			return null
		}
		const card = this.unitCards[0]
		this.removeCard(card)
		return card
	}

	public drawBottomUnit(): ServerCard | null {
		if (this.unitCards.length === 0) {
			return null
		}
		const card = this.unitCards[this.unitCards.length - 1]
		this.removeCard(card)
		return card
	}

	public drawTopSpell(): ServerCard | null {
		if (this.spellCards.length === 0) {
			return null
		}
		const card = this.spellCards[0]
		this.removeCard(card)
		return card
	}

	public findCard(cardConstructor: CardConstructor): ServerCard | null {
		return this.findCardByClass(getClassFromConstructor(cardConstructor))
	}

	public findCardByClass(cardClass: string): ServerCard | null {
		return this.unitCards.find((card) => card.class === cardClass) || this.spellCards.find((card) => card.class === cardClass) || null
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find((card) => card.id === cardId) || this.spellCards.find((card) => card.id === cardId) || null
	}

	public discardUnit(cardToDiscard: ServerCard): void {
		this.unitCards = this.unitCards.filter((card) => card !== cardToDiscard)
	}

	public discardSpell(cardToDiscard: ServerCard): void {
		this.spellCards = this.spellCards.filter((card) => card !== cardToDiscard)
	}

	public shuffle(): void {
		this.unitCards = shuffle(this.unitCards)
		this.spellCards = shuffle(this.spellCards)
	}

	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((unitCard) => unitCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInDeckDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
