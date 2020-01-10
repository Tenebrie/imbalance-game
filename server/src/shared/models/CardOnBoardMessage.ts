import CardOnBoard from './CardOnBoard'
import CardMessage from './network/CardMessage'
import PlayerMessage from './network/PlayerMessage'

export default class CardOnBoardMessage {
	card: CardMessage
	owner: PlayerMessage
	rowIndex: number
	unitIndex: number

	constructor(card: CardMessage, owner: PlayerMessage, rowIndex: number, unitIndex: number) {
		this.card = card
		this.owner = owner
		this.rowIndex = rowIndex
		this.unitIndex = unitIndex
	}

	static fromCardOnBoard(cardOnBoard: CardOnBoard, rowIndex: number, unitIndex: number) {
		const cardMessage = CardMessage.fromCard(cardOnBoard.card)
		const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player)
		return new CardOnBoardMessage(cardMessage, ownerMessage, rowIndex, unitIndex)
	}
}
