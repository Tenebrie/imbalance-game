import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffUnitToSpellConversion extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
			features: [BuffFeature.PROTECTED],
			cardFeatures: [CardFeature.LOW_SORT_PRIORITY],
		})
	}

	getUnitCostOverride(): number {
		return 0
	}

	getSpellCostOverride(): number {
		return this.parent.stats.basePower
	}
}
