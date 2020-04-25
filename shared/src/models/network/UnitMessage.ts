import Unit from '../Unit'
import CardMessage from './CardMessage'
import PlayerMessage from './PlayerMessage'

export default class UnitMessage {
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

	public static fromCardOnBoard(cardOnBoard: Unit): UnitMessage {
		const cardMessage = CardMessage.fromCard(cardOnBoard.card)
		const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player)
		return new UnitMessage(cardMessage, ownerMessage, -1, -1)
	}

	public static fromCardOnBoardWithIndex(cardOnBoard: Unit, rowIndex: number, unitIndex: number): UnitMessage {
		const cardMessage = CardMessage.fromCard(cardOnBoard.card)
		const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player)
		return new UnitMessage(cardMessage, ownerMessage, rowIndex, unitIndex)
	}
}
