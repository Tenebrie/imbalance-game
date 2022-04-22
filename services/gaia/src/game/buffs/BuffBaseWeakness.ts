import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

import { BuffConstructorParams, ServerStackableCardBuff } from '../models/buffs/ServerBuff'

export default class BuffBaseWeakness extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.INVISIBLE, BuffFeature.CAN_DESTROY],
		})

		this.createBasePowerOverride().substract(() => this.stacks)
		this.createMaxPowerOverride().substract(() => this.stacks)
	}
}
