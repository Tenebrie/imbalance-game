import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffSpellExtraCost extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createSpellCostOverride().add(1)
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost + 1
	}
}
