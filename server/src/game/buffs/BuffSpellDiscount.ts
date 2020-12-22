import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffSpellDiscount extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.LOW_SORT_PRIORITY, CardFeature.TEMPORARY_CARD],
		})
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost - 1
	}
}
