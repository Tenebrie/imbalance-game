import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowFrost extends ServerRowBuff {
	public static DAMAGE = 2

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

		const lowestPower = cards.sort((a, b) => a.card.stats.power - b.card.stats.power)[0].card.stats.power
		const lowestUnits = cards.filter((unit) => unit.card.stats.power === lowestPower)
		const targetUnit = shuffle(lowestUnits)[0]
		targetUnit.dealDamage(DamageInstance.fromRow(BuffGwentRowFrost.DAMAGE, this.parent))
	}
}
