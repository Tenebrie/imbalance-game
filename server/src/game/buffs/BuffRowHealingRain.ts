import { BuffConstructorParams, ServerRowBuff } from '../models/buffs/ServerBuff'
import ServerDamageInstance from '../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffRowHealingRain extends ServerRowBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_ENDED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const cards = this.parent.cards.sort(
			(a, b) => b.card.stats.maxPower - b.card.stats.power - (a.card.stats.maxPower - a.card.stats.power)
		)
		const weakestCards = cards.slice(0, 3)
		weakestCards.forEach((unit) => {
			this.game.animation.thread(() => {
				unit.card.heal(ServerDamageInstance.fromRow(1, this.parent))
			})
		})
	}
}
