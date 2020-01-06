import Card from '../../shared/models/Card'
import RenderedCard from '@/Pixi/models/RenderedCard'
import CardHandMessage from '../../shared/models/network/CardHandMessage'

export default class RenderedCardHand {
	cards: RenderedCard[]

	constructor(cards: Card[]) {
		this.cards = cards.map(card => RenderedCard.fromCard(card))
	}

	addCard(card: Card) {
		const renderedCard = RenderedCard.fromCard(card)
		this.cards.push(renderedCard)
	}

	public static fromMessage(message: CardHandMessage): RenderedCardHand {
		const cards = message.cards.map(cardMessage => Card.fromMessage(cardMessage))
		return new RenderedCardHand(cards)
	}
}
