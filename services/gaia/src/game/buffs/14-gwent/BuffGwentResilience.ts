import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentResilience extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION, BuffFeature.INVISIBLE],
			cardFeatures: [CardFeature.RESILIENCE],
		})
	}
}
