import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameHookType from '../models/events/GameHookType'
import ServerDamageInstance from '../models/ServerDamageSource'

export default class BuffImmunity extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			cardFeatures: [CardFeature.UNTARGETABLE],
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE)
			.require(({ targetCard }) => targetCard === this.parent)
			.replace((args) => ({
				...args,
				damageInstance: BuffImmunity.getUpdatedDamageInstance(args.damageInstance),
			}))
	}

	private static getUpdatedDamageInstance(damageInstance: ServerDamageInstance): ServerDamageInstance {
		const clone = damageInstance.clone()
		clone.value = 0
		return clone
	}
}
