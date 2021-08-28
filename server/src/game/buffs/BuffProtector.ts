import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import CardFeature from '@shared/enums/CardFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'
import GameHookType from '../models/events/GameHookType'
import CardLocation from '@shared/enums/CardLocation'
import MoveDirection from '@shared/enums/MoveDirection'
import BuffFeature from '@shared/enums/BuffFeature'
import DamageSource from '@shared/enums/DamageSource'

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
					(damageInstance.source === DamageSource.CARD && damageInstance.sourceCard?.owner !== this.parent.owner)
			)
			.require(({ targetCard }) => {
				const thisUnit = this.unit!
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
