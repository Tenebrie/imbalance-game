import Card from '../Card'
import CardBuffs from '../CardBuffs'
import HiddenBuffMessage from './HiddenBuffMessage'

export default class HiddenCardBuffsMessage implements CardBuffs {
	cardId: string
	buffs: HiddenBuffMessage[]

	card: Card // Unassigned

	constructor(cardBuffs: CardBuffs) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new HiddenBuffMessage(buff))
	}
}
