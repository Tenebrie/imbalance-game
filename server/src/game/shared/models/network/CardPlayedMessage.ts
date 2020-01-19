import Card from '../Card'

export default class CardPlayedMessage {
	id: string
	rowIndex: number
	unitIndex: number

	constructor(card: Card, rowIndex: number, unitIndex: number) {
		this.id = card.id
		this.rowIndex = rowIndex
		this.unitIndex = unitIndex
	}

	static fromCard(card: Card): CardPlayedMessage {
		return new CardPlayedMessage(card, 0, 0)
	}

	static fromCardOnRow(card: Card, rowIndex: number, unitIndex: number): CardPlayedMessage {
		return new CardPlayedMessage(card, rowIndex, unitIndex)
	}
}
