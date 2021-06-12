import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffSpellDiscount from './BuffSpellDiscount'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffSpellDiscountPerTurn extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.parent.owner)
			.perform(() => onTurnStart())

		const onTurnStart = () => {
			this.parent.buffs.add(BuffSpellDiscount, this.parent, BuffDuration.INFINITY)
		}
	}
}
