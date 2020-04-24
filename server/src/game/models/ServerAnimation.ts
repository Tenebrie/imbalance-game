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

	public static unitAttack(sourceUnit: ServerUnit, targetUnits: ServerUnit[], damage = 0): ServerAnimation {
		const params: UnitAttackAnimParams = {
			damage: damage
		}
		const animation = new ServerAnimation(AnimationType.UNIT_ATTACK, params)
		animation.sourceUnit = sourceUnit
		animation.targetUnits = targetUnits
		return animation
	}

	public static unitAttackDefault(sourceUnit: ServerUnit, targetUnits: ServerUnit[]): ServerAnimation {
		return ServerAnimation.unitAttack(sourceUnit, targetUnits, sourceUnit.card.attack)
	}

	public static postUnitAttack(): ServerAnimation {
		return new ServerAnimation(AnimationType.POST_UNIT_ATTACK, {})
	}

	public static unitMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.ALL_UNITS_MOVE, {})
	}
}
