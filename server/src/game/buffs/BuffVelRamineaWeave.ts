import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffVelRamineaWeave extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.ROUND_STARTED).perform(() => this.onRoundStarted())
	}

	private onRoundStarted(): void {
		this.card.buffs.removeAll(BuffVelRamineaWeave)
	}
}
