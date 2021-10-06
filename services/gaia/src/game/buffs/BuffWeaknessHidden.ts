import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

import { BuffConstructorParams, ServerStackableCardBuff } from '../models/buffs/ServerBuff'

export default class BuffWeaknessHidden extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.INVISIBLE, BuffFeature.SKIP_ANIMATION],
		})

		this.createMaxPowerOverride().substract(() => this.stacks)
	}
}
