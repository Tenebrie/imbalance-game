import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'

export default class BuffSpellExtraCostThisRound extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})
		this.createCallback(GameEventType.ROUND_ENDED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.parent.buffs.removeByReference(this))
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost + 1
	}
}
