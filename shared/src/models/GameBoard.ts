import GameBoardRow from './GameBoardRow'

export default class GameBoard {
	rows: GameBoardRow[]

	constructor() {
		this.rows = []
		for (let i = 0; i < 6; i++) {
			this.rows.push(new GameBoardRow(this))
		}
	}
}
