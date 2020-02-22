import Core from '@/Pixi/Core'
import Utils from '@/utils/Utils'
import CardHand from '@/Pixi/shared/models/CardHand'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import RenderedCard from '@/Pixi/board/RenderedCard'
import CardHandMessage from '../shared/models/network/CardHandMessage'
import CardType from '@/Pixi/shared/enums/CardType'

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
		if (card.cardType === CardType.UNIT) {
			this.addUnit(card)
		} else if (card.cardType === CardType.SPELL) {
			this.addSpell(card)
		} else {
			console.error('Trying to hidden card to hand without type specified!')
		}
	}

	public addUnit(card: RenderedCard) {
		this.unitCards.push(card)
		this.unitCards.sort((a: RenderedCard, b: RenderedCard) => {
			return a.unitSubtype - b.unitSubtype || b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass)
		})
	}

	public addSpell(card: RenderedCard) {
		this.spellCards.push(card)
		this.spellCards.sort((a: RenderedCard, b: RenderedCard) => {
			return b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass)
		})
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
