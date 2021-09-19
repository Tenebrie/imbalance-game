import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffFeature from '@shared/enums/BuffFeature'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffSpellDiscount from './BuffSpellDiscount'

export default class BuffSpellDiscountPerTurn extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => onTurnStart())

		const onTurnStart = () => {
			this.parent.buffs.add(BuffSpellDiscount, this.parent, BuffDuration.INFINITY)
		}
	}
}
