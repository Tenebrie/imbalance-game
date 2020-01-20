import GameBoardRowMessage from './GameBoardRowMessage'
import GameBoard from '../GameBoard'

export default class GameBoardMessage {
	rows: GameBoardRowMessage[]

	constructor(board: GameBoard) {
		this.rows = board.rows.map(row => new GameBoardRowMessage(row))
	}
}
