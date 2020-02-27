import Card from '../Card'
import BuffContainer from '../BuffContainer'
import BuffMessage from './BuffMessage'

export default class CardBuffsMessage implements BuffContainer {
	cardId: string
	buffs: BuffMessage[]

	card: Card // Unassigned

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new BuffMessage(buff))
	}
}
