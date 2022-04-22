import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardTribe from '@shared/enums/CardTribe'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentDoomed extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.SKIP_ANIMATION, BuffFeature.INVISIBLE],
			cardTribes: [CardTribe.DOOMED],
		})
	}
}
