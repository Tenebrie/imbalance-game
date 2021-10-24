import BuffAlignment from '@shared/enums/BuffAlignment'
import { BuffConstructorParams, ServerCardBuff } from '@src/game/models/buffs/ServerBuff'

export default class TestingBuffDispellableNegative extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})
	}
}
