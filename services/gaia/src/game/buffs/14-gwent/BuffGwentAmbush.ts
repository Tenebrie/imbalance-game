import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import GameHookType from '@src/game/models/events/GameHookType'
import { cloneDamageInstance } from '@src/game/models/ServerDamageSource'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentAmbush extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.PROTECTED, BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.UNTARGETABLE, CardFeature.UNSPLASHABLE],
		})

		this.createLocalization({
			en: {
				name: 'Ambush',
				description: 'Test',
			},
		})

		this.createMaxPowerOverride().setTo(0)

		this.createHook(GameHookType.CARD_TAKES_DAMAGE)
			.require(({ targetCard }) => targetCard === this.parent)
			.replace((args) => ({
				...args,
				damageInstance: cloneDamageInstance(args.damageInstance, {
					value: 0,
				}),
			}))

		this.createEffect(GameEventType.CARD_REVEALED).perform(() => this.parent.buffs.removeByReference(this))
	}
}
