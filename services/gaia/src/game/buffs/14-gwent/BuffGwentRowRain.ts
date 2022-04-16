import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowRain extends ServerRowBuff {
	public static DAMAGE = 1
	public static TARGETS = 2

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_ENDED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const cards = this.parent.cards
		if (cards.length === 0) {
			return
		}

		const targets = getMultipleRandomArrayValues(cards, BuffGwentRowRain.TARGETS)
		targets.forEach((target) => {
			this.game.animation.thread(() => {
				target.dealDamage(DamageInstance.fromRow(BuffGwentRowRain.DAMAGE, this.parent))
			})
		})
	}
}
