import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import { BuffConstructorParams, ServerCardBuff } from '@src/game/models/buffs/ServerBuff'

export class BuffMorningApathy extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
			features: [BuffFeature.PROTECTED],
			cardFeatures: [CardFeature.APATHY],
		})
	}
}
