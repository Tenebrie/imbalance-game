import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameHookType from '../models/events/GameHookType'
import { cloneDamageInstance } from '../models/ServerDamageSource'

export default class BuffPermanentImmunity extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.PROTECTED],
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
