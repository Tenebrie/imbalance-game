import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentUsedLeader extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.PROTECTED, BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.UNPLAYABLE],
		})

		this.createLocalization({
			en: {
				name: 'Used Leader',
				description: 'This leader card has already been used this game.',
			},
		})
	}
}
