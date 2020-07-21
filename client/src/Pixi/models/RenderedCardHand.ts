import Core from '@/Pixi/Core'
import Utils from '@/utils/Utils'
import CardHand from '@shared/models/CardHand'
import CardMessage from '@shared/models/network/CardMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardHandMessage from '@shared/models/network/CardHandMessage'
import CardType from '@shared/enums/CardType'

export default class RenderedCardHand implements CardHand {
	unitCards: RenderedCard[]
	spellCards: RenderedCard[]

	constructor(unitCards: RenderedCard[], spellCards: RenderedCard[]) {
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public get allCards() {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public addCard(card: RenderedCard) {
		if (card.type === CardType.UNIT) {
			this.addUnit(card)
		} else if (card.type === CardType.SPELL) {
			this.addSpell(card)
		} else {
			console.error('Trying to hidden card to hand without type specified!')
		}
	}

	public addUnit(card: RenderedCard) {
		this.unitCards.push(card)
		this.unitCards = Utils.sortCards(this.unitCards)
	}

	public addSpell(card: RenderedCard) {
		this.spellCards.push(card)
		this.spellCards = Utils.sortCards(this.spellCards)
	}

	public sortCards() {
		this.unitCards = Utils.sortCards(this.unitCards)
		this.spellCards = Utils.sortCards(this.spellCards)
	}

	public findCardById(cardId: string): RenderedCard | null {
		return this.unitCards.find(renderedCard => renderedCard.id === cardId) || this.spellCards.find(renderedCard => renderedCard.id === cardId) || null
	}

	public reveal(data: CardMessage): void {
		const card = this.findCardById(data.id)
		if (!card) { return }

		const revealedCard = new RenderedCard(data)
		revealedCard.switchToCardMode()
		Core.registerCard(revealedCard)
		this.unitCards.splice(this.unitCards.indexOf(card), 1, revealedCard)
		Core.unregisterCard(card)
	}

	public destroyCard(card: RenderedCard) {
		this.unitCards = this.unitCards.filter(unitCard => unitCard !== card)
		this.spellCards = this.spellCards.filter(unitCard => unitCard !== card)
		card.unregister()
	}

	public destroyCardById(cardId: string) {
		const card = this.findCardById(cardId)
		if (!card) { return }
		this.destroyCard(card)
	}

	public static fromMessage(message: CardHandMessage): RenderedCardHand {
		const unitCards = message.unitCards.map(cardMessage => RenderedCard.fromMessage(cardMessage))
		const spellCards = message.spellCards.map(cardMessage => RenderedCard.fromMessage(cardMessage))
		return new RenderedCardHand(unitCards, spellCards)
	}
}
