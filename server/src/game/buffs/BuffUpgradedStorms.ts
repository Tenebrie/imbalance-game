import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffUpgradedStorms extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})
	}
}
