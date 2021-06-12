import { BuffConstructorParams, ServerRowBuff } from '../models/buffs/ServerBuff'
import ServerDamageInstance from '../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffRowBurning extends ServerRowBuff {
	burnDamage = 1

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.parent.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		this.parent.cards.forEach((unit) => {
			this.game.animation.thread(() => {
				unit.card.dealDamage(ServerDamageInstance.fromRow(this.burnDamage, this.parent))
			})
		})
	}
}
