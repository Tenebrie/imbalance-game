import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffExtraArmor extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})
		this.createEffect(GameEventType.CARD_BUFF_CREATED).perform(() => {
			this.parent.stats.armor = this.parent.stats.armor + 1
		})

		this.createMaxArmorOverride().add(1)
	}
}
