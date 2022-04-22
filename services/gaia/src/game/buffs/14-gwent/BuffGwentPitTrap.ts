import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentPitTrap extends ServerRowBuff {
	public static readonly DAMAGE = 3

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
		})

		this.createEffect(GameEventType.ROW_BUFF_CREATED).perform(() => {
			this.parent.splashableCards.forEach((unit) => {
				this.game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromRow(BuffGwentPitTrap.DAMAGE, this.parent))
				})
				this.game.animation.syncAnimationThreads()
			})
		})

		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.rowIndex === this.parent.index)
			.perform(({ triggeringUnit }) => {
				triggeringUnit.dealDamage(DamageInstance.fromRow(BuffGwentPitTrap.DAMAGE, this.parent))
			})

		this.createCallback(GameEventType.UNIT_MOVED)
			.require(({ toIndex }) => toIndex === this.parent.index)
			.perform(({ triggeringUnit }) => {
				triggeringUnit.dealDamage(DamageInstance.fromRow(BuffGwentPitTrap.DAMAGE, this.parent))
			})
	}
}
