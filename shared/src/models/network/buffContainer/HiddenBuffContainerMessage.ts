import BuffContainer from '../../BuffContainer'
import HiddenBuffMessage from '../buffs/HiddenBuffMessage'
import BuffContainerMessage from './BuffContainerMessage'

export default class HiddenBuffContainerMessage implements BuffContainerMessage {
	buffs: HiddenBuffMessage[]

	constructor(cardBuffs: BuffContainer) {
		// this.buffs = cardBuffs.buffs.map((buff) => new HiddenBuffMessage(buff))
		this.buffs = []
	}
}
