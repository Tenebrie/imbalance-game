import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@src/../../shared/src/enums/GameEventType'

export default class BuffSpellExtraCostThisRound extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})
		this.createCallback(GameEventType.ROUND_ENDED)
			.require(({ player }) => {
				const owner = this.card.owner
				return !!owner && player === owner
			})
			.perform(() => this.card.buffs.removeByReference(this))
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost + 1
	}
}
