import BuffContainer from '../BuffContainer'
import HiddenBuffMessage from './HiddenBuffMessage'

export default class HiddenBuffContainerMessage {
	cardId: string
	buffs: HiddenBuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new HiddenBuffMessage(buff))
	}
}
