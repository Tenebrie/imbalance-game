import CardOnBoard from '../CardOnBoard'
import CardMessage from './CardMessage'
import PlayerMessage from './PlayerMessage'

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

	public static fromCardOnBoard(cardOnBoard: CardOnBoard): CardOnBoardMessage {
		const cardMessage = CardMessage.fromCard(cardOnBoard.card)
		const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player)
		return new CardOnBoardMessage(cardMessage, ownerMessage, -1, -1)
	}

	public static fromCardOnBoardWithIndex(cardOnBoard: CardOnBoard, rowIndex: number, unitIndex: number): CardOnBoardMessage {
		const cardMessage = CardMessage.fromCard(cardOnBoard.card)
		const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player)
		return new CardOnBoardMessage(cardMessage, ownerMessage, rowIndex, unitIndex)
	}
}
