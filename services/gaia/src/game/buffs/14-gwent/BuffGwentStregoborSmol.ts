import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentStregoborSmol extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.PROTECTED],
		})

		this.createLocalization({
			en: {
				name: `Stregobor\'s Curse`,
				description: `This unit's power is set to 1`,
			},
		})

		this.createMaxPowerOverride().setTo(1)
	}
}
