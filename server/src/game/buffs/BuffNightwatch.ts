import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import CardFeature from '@shared/enums/CardFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffNightwatch extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			cardFeatures: [CardFeature.NIGHTWATCH],
		})
	}
}
