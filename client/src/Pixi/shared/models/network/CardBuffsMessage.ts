import Card from '../Card'
import CardBuffs from '../CardBuffs'
import BuffMessage from './BuffMessage'

export default class CardBuffsMessage implements CardBuffs {
	cardId: string
	buffs: BuffMessage[]

	card: Card // Unassigned

	constructor(cardBuffs: CardBuffs) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new BuffMessage(buff))
	}
}
