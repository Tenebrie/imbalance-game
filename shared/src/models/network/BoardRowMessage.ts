import BoardRow from '../BoardRow'

export default class BoardRowMessage {
	index: number
	ownerId: string

	constructor(row: BoardRow) {
		this.index = row.index
		this.ownerId = row.owner ? row.owner.player.id : ''
	}
}
