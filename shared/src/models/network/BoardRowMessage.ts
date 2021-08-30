import BoardRow from '../BoardRow'
import BuffContainerMessage from './buffContainer/BuffContainerMessage'
import OpenBuffContainerMessage from './buffContainer/OpenBuffContainerMessage'
import UnitMessage from './UnitMessage'

export default class BoardRowMessage {
	index: number
	ownerId: string
	cards: UnitMessage[]
	buffs: BuffContainerMessage

	constructor(row: BoardRow) {
		this.index = row.index
		this.ownerId = row.owner ? row.owner.id : ''
		this.cards = row.cards.map((card) => new UnitMessage(card))
		this.buffs = new OpenBuffContainerMessage(row.buffs)
	}
}
