import Animation from '../shared/models/Animation'
import ServerCardOnBoard from './ServerCardOnBoard'
import AnimationType from '../shared/enums/AnimationType'
import ServerCard from './ServerCard'

export default class ServerAnimation extends Animation {
	public static delay(): ServerAnimation {
		return new ServerAnimation(AnimationType.DELAY)
	}

	public static cardPlay(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_PLAY)
		animation.targetCard = targetCard
		return animation
	}

	public static unitAttack(sourceUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIT_ATTACK)
		animation.sourceUnit = sourceUnit
		animation.targetUnit = targetUnit
		return animation
	}

	public static postUnitAttack(): ServerAnimation {
		return new ServerAnimation(AnimationType.POST_UNIT_ATTACK)
	}

	public static allUnitsMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.ALL_UNITS_MOVE)
	}
}
