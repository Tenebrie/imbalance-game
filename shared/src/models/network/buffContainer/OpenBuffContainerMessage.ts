import BuffContainer from '../../BuffContainer'
import OpenBuffMessage from '../buffs/OpenBuffMessage'
import BuffContainerMessage from './BuffContainerMessage'

export default class OpenBuffContainerMessage implements BuffContainerMessage {
	cardId: string
	buffs: OpenBuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		this.cardId = cardBuffs.card.id
		this.buffs = cardBuffs.buffs.map((buff) => new OpenBuffMessage(buff))
	}
}
