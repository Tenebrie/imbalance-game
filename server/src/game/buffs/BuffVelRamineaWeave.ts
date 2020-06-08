import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'

export default class BuffVelRamineaWeave extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY)
	}

	onRoundStarted(): void {
		this.card.buffs.remove(BuffVelRamineaWeave)
	}
}
