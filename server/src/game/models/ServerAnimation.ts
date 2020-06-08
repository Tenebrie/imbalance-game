import Animation from '@shared/models/Animation'
import ServerUnit from './ServerUnit'
import AnimationType from '@shared/enums/AnimationType'
import ServerCard from './ServerCard'
import UnitAttackAnimParams from '@shared/models/animations/UnitAttackAnimParams'

export default class ServerAnimation extends Animation {
	public static delay(): ServerAnimation {
		return new ServerAnimation(AnimationType.DELAY, {})
	}

	public static cardPlay(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_PLAY, {})
		animation.targetCard = targetCard
		return animation
	}

	public static unitAttacksUnits(sourceUnit: ServerUnit, targetUnits: ServerUnit[], damage = 0): ServerAnimation {
		const params: UnitAttackAnimParams = {
			damage: damage
		}
		const animation = new ServerAnimation(AnimationType.UNIT_ATTACK, params)
		animation.sourceUnit = sourceUnit
		animation.targetCards = targetUnits.map(unit => unit.card)
		return animation
	}

	public static unitAttackDefault(sourceUnit: ServerUnit, targetUnits: ServerUnit[]): ServerAnimation {
		return ServerAnimation.unitAttacksUnits(sourceUnit, targetUnits, sourceUnit.card.attack)
	}

	public static universeAttacksUnits(targetUnits: ServerUnit[], damage = 0): ServerAnimation {
		const params: UnitAttackAnimParams = {
			damage: damage
		}
		const animation = new ServerAnimation(AnimationType.UNIVERSE_ATTACK, params)
		animation.targetCards = targetUnits.map(unit => unit.card)
		return animation
	}

	public static postUnitAttack(): ServerAnimation {
		return new ServerAnimation(AnimationType.POST_UNIT_ATTACK, {})
	}

	public static unitMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.UNIT_MOVE, {})
	}
}
