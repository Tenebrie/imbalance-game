import Card from '../Card'

export default class CardAttackOrderMessage {
	cardId: string
	targetId: string

	constructor(cardId: string, targetId: string) {
		this.cardId = cardId
		this.targetId = targetId
	}

	static fromCards(card: Card, target: Card): CardAttackOrderMessage {
		return new CardAttackOrderMessage(card.id, target.id)
	}
}
