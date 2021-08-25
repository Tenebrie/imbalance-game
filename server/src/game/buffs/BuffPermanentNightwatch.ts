import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import CardFeature from '@shared/enums/CardFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffPermanentNightwatch extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.PROTECTED],
			cardFeatures: [CardFeature.NIGHTWATCH],
		})
	}
}
