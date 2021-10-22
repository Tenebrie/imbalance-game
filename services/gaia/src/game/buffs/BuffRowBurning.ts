import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerRowBuff } from '../models/buffs/ServerBuff'
import { DamageInstance } from '../models/ServerDamageSource'

export default class BuffRowBurning extends ServerRowBuff {
	burnDamage = 1

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_ENDED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		this.parent.cards.forEach((unit) => {
			this.game.animation.thread(() => {
				unit.card.dealDamage(DamageInstance.fromRow(this.burnDamage, this.parent))
			})
		})
	}
}
