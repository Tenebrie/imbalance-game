import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffStrength from './BuffStrength'

export default class BuffGrowth extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group === this.parent.ownerGroup)
			.perform(() => onTurnStart())

		const onTurnStart = () => {
			this.parent.buffs.add(BuffStrength, this.parent, BuffDuration.INFINITY)
		}
	}
}
