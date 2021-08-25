import BuffContainer from '../../BuffContainer'
import OpenBuffMessage from '../buffs/OpenBuffMessage'
import BuffContainerMessage from './BuffContainerMessage'

export default class OpenBuffContainerMessage implements BuffContainerMessage {
	buffs: OpenBuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		this.buffs = cardBuffs.buffs.map((buff) => new OpenBuffMessage(buff))
	}
}
