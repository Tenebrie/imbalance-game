import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffHiddenStrength extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createEffect(GameEventType.BUFF_CREATED).perform(() => this.onCreated())
	}

	private onCreated(): void {
		this.card.stats.power = this.card.stats.power + 1
	}

	getMaxPowerOverride(baseValue: number): number {
		return baseValue + 1
	}
}
