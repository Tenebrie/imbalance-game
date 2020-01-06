import Card from './Card'
import Player from './Player'
import GameBoardRow from './GameBoardRow'

export default class CardOnBoard {
	card: Card
	owner: Player | null
	gameBoardRow: GameBoardRow

	constructor(card: Card, owner: Player | null, gameBoardRow: GameBoardRow) {
		this.card = card
		this.owner = owner
		this.gameBoardRow = gameBoardRow
	}

	static newInstance(card: Card, owner: Player | null, gameBoardRow: GameBoardRow) {
		return new CardOnBoard(card, owner, gameBoardRow)
	}
}
