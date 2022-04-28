import BuffAlignment from '@shared/enums/BuffAlignment'
import { BuffConstructorParams, ServerRowBuff } from '@src/game/models/buffs/ServerBuff'

export default class TestingBuffBoon extends ServerRowBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})
	}
}
