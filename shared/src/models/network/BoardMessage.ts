import BoardRowMessage from './BoardRowMessage'
import Board from '../Board'

export default class BoardMessage {
	rows: BoardRowMessage[]

	constructor(board: Board) {
		this.rows = board.rows.map(row => new BoardRowMessage(row))
	}
}
