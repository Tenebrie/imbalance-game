import Board from '../Board'
import BoardRowMessage from './BoardRowMessage'

export default class BoardMessage {
	rows: BoardRowMessage[]

	constructor(board: Board) {
		this.rows = board.rows.map((row) => new BoardRowMessage(row))
	}
}
