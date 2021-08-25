import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffNoArmor extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createMaxArmorOverride().setTo(0)
	}
}
