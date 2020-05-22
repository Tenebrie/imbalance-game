import BuffContainer from '../BuffContainer'
import BuffMessage from './BuffMessage'

export default class BuffContainerMessage {
	cardId: string
	buffs: BuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new BuffMessage(buff))
	}
}
