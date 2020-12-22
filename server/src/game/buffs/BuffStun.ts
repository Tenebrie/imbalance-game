import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import CardFeature from '@shared/enums/CardFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffStun extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			cardFeatures: [CardFeature.STUNNED],
		})
	}
}
