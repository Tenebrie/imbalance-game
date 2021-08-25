import Core from '@/Pixi/Core'
import CardHand from '@shared/models/CardHand'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardType from '@shared/enums/CardType'
import CardHandMessage from '@shared/models/network/cardHand/CardHandMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { sortCards } from '@shared/Utils'

export default class RenderedCardHand implements CardHand {
	unitCards: RenderedCard[]
	spellCards: RenderedCard[]

	constructor(unitCards: RenderedCard[], spellCards: RenderedCard[]) {
		this.unitCards = unitCards
		this.spellCards = spellCards
		this.sortCards()
	}

	public get allCards(): RenderedCard[] {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public addCard(card: RenderedCard): void {
		if (card.type === CardType.UNIT) {
			this.addUnit(card)
		} else if (card.type === CardType.SPELL) {
			this.addSpell(card)
		} else {
			console.error('Trying to hidden card to hand without type specified!')
		}
	}

	public addUnit(card: RenderedCard): void {
		this.unitCards.push(card)
		this.unitCards = sortCards(this.unitCards)
	}

	public addSpell(card: RenderedCard): void {
		this.spellCards.push(card)
		this.spellCards = sortCards(this.spellCards)
	}

	public sortCards(): void {
		this.unitCards = sortCards(this.unitCards)
		this.spellCards = sortCards(this.spellCards)
	}

	public findCardById(cardId: string): RenderedCard | null {
		return (
			this.unitCards.find((renderedCard) => renderedCard.id === cardId) ||
			this.spellCards.find((renderedCard) => renderedCard.id === cardId) ||
			null
		)
	}

	public reveal(data: OpenCardMessage): RenderedCard | null {
		const card = this.findCardById(data.id)
		if (!card) {
			return null
		}

		const revealedCard = new RenderedCard(data)
		revealedCard.switchToCardMode()
		revealedCard.coreContainer.alpha = 1
		revealedCard.sprite.alpha = 1
		Core.registerCard(revealedCard)
		if (this.unitCards.includes(card)) {
			this.unitCards.splice(this.unitCards.indexOf(card), 1, revealedCard)
		} else if (this.spellCards.includes(card)) {
			this.spellCards.splice(this.spellCards.indexOf(card), 1, revealedCard)
		}
		Core.destroyCard(card)
		return revealedCard
	}

	public removeCard(card: RenderedCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard !== card)
	}

	public removeCardById(cardId: string): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard.id !== cardId)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard.id !== cardId)
	}

	public destroyCard(card: RenderedCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard !== card)
		Core.destroyCard(card)
	}

	public destroyCardById(cardId: string): void {
		const card = this.findCardById(cardId)
		if (!card) {
			return
		}
		this.destroyCard(card)
	}

	public static fromMessage(message: CardHandMessage): RenderedCardHand {
		const unitCards = message.unitCards.map((cardMessage) => RenderedCard.fromMessage(cardMessage))
		const spellCards = message.spellCards.map((cardMessage) => RenderedCard.fromMessage(cardMessage))
		return new RenderedCardHand(unitCards, spellCards)
	}
}
