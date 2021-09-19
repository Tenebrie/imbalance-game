import BuffAlignment from '@shared/enums/BuffAlignment'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'

export default class BuffWeakness extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createMaxPowerOverride().substract(1)
	}
}
