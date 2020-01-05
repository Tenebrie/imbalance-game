import { Card } from './Card'
import GameBoardRow from './GameBoardRow'

export default class GameBoard {
	rows: GameBoardRow[]

	constructor() {
		this.rows = []
		for (let i = 0; i < 6; i++) {
			this.rows.push(new GameBoardRow(this))
		}
	}

	public getCardRow(card: Card): GameBoardRow {
		return this.rows.find((row: GameBoardRow) => row.containsCard(card))
	}

	public getAllCards(): Card[] {
		return this.rows.map(row => row.cards).flat().map(cardOnBoard => cardOnBoard.card)
	}
}
