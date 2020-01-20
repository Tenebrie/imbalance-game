import GameBoardRow from '../GameBoardRow'

export default class GameBoardRowMessage {
	index: number
	ownerId: string

	constructor(row: GameBoardRow) {
		this.index = row.index
		this.ownerId = row.owner ? row.owner.player.id : ''
	}
}
