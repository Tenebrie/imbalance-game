import BoardRow from '../BoardRow'
import UnitMessage from './UnitMessage'

export default class BoardRowMessage {
	index: number
	ownerId: string
	cards: UnitMessage[]

	constructor(row: BoardRow) {
		this.index = row.index
		this.ownerId = row.owner ? row.owner.player.id : ''
		this.cards = row.cards.map((card) => new UnitMessage(card))
	}
}
