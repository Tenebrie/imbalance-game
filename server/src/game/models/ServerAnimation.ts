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

	public static cardAttacksCards(sourceCard: ServerCard, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_ATTACK, {})
		animation.sourceCard = sourceCard
		animation.targetCards = targetCards
		return animation
	}

	public static cardAttacksUnits(sourceCard: ServerCard, targetUnits: ServerUnit[]): ServerAnimation {
		return ServerAnimation.cardAttacksCards(sourceCard, targetUnits.map(unit => unit.card))
	}

	public static unitAttackDefault(sourceUnit: ServerUnit, targetUnits: ServerUnit[]): ServerAnimation {
		return ServerAnimation.cardAttacksCards(sourceUnit.card, targetUnits.map(unit => unit.card))
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
		return new ServerAnimation(AnimationType.POST_CARD_ATTACK, {})
	}

	public static unitMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.UNIT_MOVE, {})
	}
}
