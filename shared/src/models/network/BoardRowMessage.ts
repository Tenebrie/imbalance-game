import BoardRow from '../BoardRow'
import BuffContainerMessage from './buffContainer/BuffContainerMessage'
import OpenBuffContainerMessage from './buffContainer/OpenBuffContainerMessage'
import OpenUnitMessage from './unit/OpenUnitMessage'

export default class BoardRowMessage {
	index: number
	ownerId: string
	cards: OpenUnitMessage[]
	buffs: BuffContainerMessage

	constructor(row: BoardRow) {
		this.index = row.index
		this.ownerId = row.owner ? row.owner.id : ''
		this.cards = row.cards.map((card) => new OpenUnitMessage(card))
		this.buffs = new OpenBuffContainerMessage(row.buffs)
	}
}
