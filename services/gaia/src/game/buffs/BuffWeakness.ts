import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

import { BuffConstructorParams, ServerStackableCardBuff } from '../models/buffs/ServerBuff'

export default class BuffWeakness extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.INVISIBLE, BuffFeature.CAN_DESTROY],
		})

		this.createMaxPowerOverride().substract(() => this.stacks)
	}
}
