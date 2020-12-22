import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffUnitToSpellConversion extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
			cardFeatures: [CardFeature.LOW_SORT_PRIORITY],
		})
	}

	getUnitCostOverride(): number {
		return 0
	}

	getSpellCostOverride(): number {
		return this.card.stats.basePower
	}
}
