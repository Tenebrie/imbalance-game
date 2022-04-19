import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowDragonsDream extends ServerRowBuff {
	public static readonly DAMAGE = 4

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createCallback(GameEventType.CARD_RESOLVED)
			.require(({ triggeringCard }) => triggeringCard !== this.source)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(() => {
				const targets = this.parent.cards
					.filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))
					.sort((a, b) => a.unitIndex - b.unitIndex)

				targets.forEach((unit) => {
					unit.dealDamage(DamageInstance.fromRow(BuffGwentRowDragonsDream.DAMAGE, this.parent), 'stagger')
				})
				this.game.animation.syncAnimationThreads()
				this.parent.buffs.removeAll(BuffGwentRowDragonsDream, null)
			})
	}
}
