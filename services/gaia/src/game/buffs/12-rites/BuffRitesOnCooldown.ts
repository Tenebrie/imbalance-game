import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffRitesOnCooldown extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.RITES_UNIT_COOLDOWN],
		})

		this.createLocalization({
			en: {
				name: 'Attack cooldown',
				description: 'Unable to attack next turn.',
			},
		})
	}
}
