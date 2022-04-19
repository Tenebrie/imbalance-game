import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowSkelligeStorm extends ServerRowBuff {
	public static readonly DAMAGE = [2, 1, 1]

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const cards = this.parent.cards
				const damage = BuffGwentRowSkelligeStorm.DAMAGE
				const sortedTargets = cards.sort((a, b) => a.unitIndex - b.unitIndex)

				damage.forEach((damageNumber, index) => {
					const target = sortedTargets[index]
					if (!target) {
						return
					}
					target.dealDamage(DamageInstance.fromRow(damageNumber, this.parent), 'stagger')
				})
			})
	}
}
