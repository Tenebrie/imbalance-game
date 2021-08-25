import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffLeaderPower extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.PROTECTED],
			cardFeatures: [CardFeature.HERO_POWER],
		})
	}
}
