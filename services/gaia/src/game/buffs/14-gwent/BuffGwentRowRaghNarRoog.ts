import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { getHighestUnit } from '@src/utils/Utils'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowRaghNarRoog extends ServerRowBuff {
	public static readonly DAMAGE = 2

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const cards = this.parent.splashableCards
		const targetUnit = getHighestUnit(cards)
		if (!targetUnit) {
			return
		}
		targetUnit.dealDamage(DamageInstance.fromRow(BuffGwentRowRaghNarRoog.DAMAGE, this.parent))
	}
}