import BuffAlignment from '@shared/enums/BuffAlignment'
import { BuffConstructorParams, ServerCardBuff } from '@src/game/models/buffs/ServerBuff'

export default class TestingBuffDispellableNeutral extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
		})
	}
}
