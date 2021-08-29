import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'

export default class BuffStrength extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createEffect(GameEventType.CARD_BUFF_CREATED).perform(() => onCreated())
		const onCreated = () => {
			this.parent.stats.power = this.parent.stats.power + 1
		}

		this.createMaxPowerOverride().add(1)
	}
}
