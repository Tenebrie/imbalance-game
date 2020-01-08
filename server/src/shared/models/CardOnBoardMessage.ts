import Card from './Card'
import Player from './Player'
import CardOnBoard from './CardOnBoard'
import CardMessage from './network/CardMessage'
import PlayerMessage from './network/PlayerMessage'

export default class CardOnBoardMessage {
	card: CardMessage
	owner: PlayerMessage
	rowIndex: number
	unitIndex: number

	constructor(card: Card, owner: Player, rowIndex: number, unitIndex: number) {
		this.card = card
		this.owner = owner
		this.rowIndex = rowIndex
		this.unitIndex = unitIndex
	}

	static fromCardOnBoard(cardOnBoard: CardOnBoard, rowIndex: number, unitIndex: number) {
		return new CardOnBoardMessage(cardOnBoard.card, cardOnBoard.owner.player, rowIndex, unitIndex)
	}
}
