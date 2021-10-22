import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameHookType from '../models/events/GameHookType'
import { cloneDamageInstance } from '../models/ServerDamageSource'

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
				damageInstance: cloneDamageInstance(args.damageInstance, {
					value: 0,
				}),
			}))
	}
}
