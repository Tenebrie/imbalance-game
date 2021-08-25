import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffHiddenStrength extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createEffect(GameEventType.CARD_BUFF_CREATED).perform(() => onCreated())
		const onCreated = () => {
			this.parent.stats.power = this.parent.stats.power + 1
		}

		this.createMaxPowerOverride().add(1)
	}
}
