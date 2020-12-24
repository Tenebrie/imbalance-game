import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffStrength from './BuffStrength'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffGrowth extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStart())
	}

	private onTurnStart(): void {
		this.card.buffs.add(BuffStrength, this.card, BuffDuration.INFINITY)
	}
}
