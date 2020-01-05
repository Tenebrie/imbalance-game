import { Card } from './Card'
import Player from './Player'
import GameBoardRow from './GameBoardRow'

export class CardOnBoard {
	card: Card
	owner: Player
	gameBoardRow: GameBoardRow

	constructor(card: Card, owner: Player, gameBoardRow: GameBoardRow) {
		this.card = card
		this.owner = owner
		this.gameBoardRow = gameBoardRow
	}

	static newInstance(card: Card, owner: Player, gameBoardRow: GameBoardRow) {
		return new CardOnBoard(card, owner, gameBoardRow)
	}
}
