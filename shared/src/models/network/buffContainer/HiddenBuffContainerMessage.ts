import BuffContainer from '../../BuffContainer'
import HiddenBuffMessage from '../buffs/HiddenBuffMessage'
import BuffContainerMessage from './BuffContainerMessage'

export default class HiddenBuffContainerMessage implements BuffContainerMessage {
	cardId: string
	buffs: HiddenBuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map(buff => new HiddenBuffMessage(buff))
	}
}
