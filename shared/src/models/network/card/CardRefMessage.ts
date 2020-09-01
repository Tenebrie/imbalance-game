import Card from '../../Card'

export default class CardRefMessage {
	public readonly id: string

	public constructor(card: Card) {
		this.id = card.id
	}
}
