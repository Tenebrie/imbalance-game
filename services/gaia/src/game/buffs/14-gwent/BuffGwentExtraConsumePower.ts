import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

import { BuffConstructorParams, ServerStackableCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentExtraConsumePower extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.PROTECTED, BuffFeature.INVISIBLE],
		})
	}
}
