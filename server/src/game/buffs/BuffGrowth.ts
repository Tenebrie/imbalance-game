import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffStrength from './BuffStrength'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffGrowth extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			// .require(({ group }) => group.owns(this.parent))
			.require(({ group }) => group === this.parent.ownerNullable)
			.perform(() => onTurnStart())

		const onTurnStart = () => {
			this.parent.buffs.add(BuffStrength, this.parent, BuffDuration.INFINITY)
		}
	}
}
