import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import DamageSource from '@shared/enums/DamageSource'
import MoveDirection from '@shared/enums/MoveDirection'

import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import GameHookType from '../models/events/GameHookType'

export default class BuffProtector extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SERVICE_BUFF],
			cardFeatures: [CardFeature.PROTECTOR],
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE)
			.require(() => this.parent.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard !== this.parent)
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => this.parent.ownerGroup.owns(targetCard))
			.require(
				({ damageInstance }) =>
					damageInstance.source === DamageSource.UNIVERSE ||
					(damageInstance.source === DamageSource.CARD && !this.parent.ownerGroup.owns(damageInstance.sourceCard!))
			)
			.require(({ targetCard }) => {
				const thisUnit = this.parent.unit!
				const targetUnit = targetCard.unit!
				const direction = this.game.board.getMoveDirection(
					this.parent.ownerGroup,
					this.game.board.rows[thisUnit.rowIndex],
					this.game.board.rows[targetUnit.rowIndex]
				)
				const horizontalDistance = this.game.board.getHorizontalUnitDistance(thisUnit, targetUnit)
				return direction === MoveDirection.BACK && horizontalDistance < 1
			})
			.replace((values) => ({
				...values,
				targetCard: this.parent,
			}))
	}
}
