import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import CardFeature from '@shared/enums/CardFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffStun extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			cardFeatures: [CardFeature.STUNNED],
		})
	}
}
