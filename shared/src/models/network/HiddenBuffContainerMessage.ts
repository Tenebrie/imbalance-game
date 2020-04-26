import BuffContainer from '../BuffContainer'
import HiddenBuffMessage from './HiddenBuffMessage'
import Card from '../Card'

export default class HiddenBuffContainerMessage {
	cardId: string
	buffs: HiddenBuffMessage[]

	card: Card // Unassigned

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new HiddenBuffMessage(buff))
	}
}
