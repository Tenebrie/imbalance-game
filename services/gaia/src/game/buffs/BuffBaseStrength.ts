import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerStackableCardBuff } from '../models/buffs/ServerBuff'

export default class BuffBaseStrength extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.INVISIBLE, BuffFeature.PROTECTED],
		})

		this.createEffect(GameEventType.CARD_BUFF_CREATED).perform(() => onCreated())
		const onCreated = () => {
			this.parent.stats.power = this.parent.stats.power + 1
		}

		this.createMaxPowerOverride().add(() => this.stacks)
		this.createBasePowerOverride().add(() => this.stacks)
	}
}
