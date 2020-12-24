import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffExtraArmor extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})
		this.createEffect(GameEventType.BUFF_CREATED).perform(() => {
			this.card.stats.armor = this.card.stats.armor + 1
		})
	}

	getMaxArmorOverride(baseValue: number): number {
		return baseValue + 1
	}
}
