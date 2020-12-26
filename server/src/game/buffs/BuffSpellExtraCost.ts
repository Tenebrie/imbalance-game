import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffSpellExtraCost extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost + 1
	}
}
