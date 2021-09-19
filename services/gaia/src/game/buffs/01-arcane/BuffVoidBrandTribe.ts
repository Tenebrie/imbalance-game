import BuffAlignment from '@shared/enums/BuffAlignment'
import CardTribe from '@shared/enums/CardTribe'
import { BuffConstructorParams, ServerCardBuff } from '@src/game/models/buffs/ServerBuff'

export default class BuffVoidBrandTribe extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			cardTribes: [CardTribe.VOIDSPAWN],
		})
	}
}
