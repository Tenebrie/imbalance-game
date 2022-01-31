import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffAttackingThisTurn extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			cardFeatures: [CardFeature.RITES_UNIT_CAN_ATTACK],
		})

		this.createLocalization({
			en: {
				name: 'Attacks this turn',
				description: 'Will attack this turn.',
			},
		})
	}
}
