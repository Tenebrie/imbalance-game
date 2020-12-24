import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import ServerDamageInstance from '../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffBurning extends ServerBuff {
	burnDamage = 1

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		this.game.animation.createAnimationThread()
		this.card.dealDamage(ServerDamageInstance.fromCard(this.burnDamage, this.card))
		this.game.animation.commitAnimationThread()
	}
}
