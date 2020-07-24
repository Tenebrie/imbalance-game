import Animation from '@shared/models/Animation'
import ServerUnit from './ServerUnit'
import AnimationType from '@shared/enums/AnimationType'
import ServerCard from './ServerCard'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'

export default class ServerAnimation extends Animation {
	public static delay(): ServerAnimation {
		return new ServerAnimation(AnimationType.DELAY, {})
	}

	public static cardAnnounce(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_ANNOUNCE, {})
		animation.targetCard = targetCard
		return animation
	}

	public static cardAttacksCards(sourceCard: ServerCard, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_ATTACK, {})
		animation.sourceCard = sourceCard
		animation.targetCards = targetCards
		return animation
	}

	public static cardAffectsCards(sourceCard: ServerCard, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_AFFECT, {})
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

	public static universeAttacksUnits(targetUnits: ServerUnit[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_ATTACK, {})
		animation.targetCards = targetUnits.map(unit => unit.card)
		return animation
	}

	public static universeAffectsCards(targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_AFFECT, {})
		animation.targetCards = targetCards
		return animation
	}

	public static postUnitAttack(): ServerAnimation {
		return new ServerAnimation(AnimationType.POST_CARD_ATTACK, {})
	}

	public static unitDeploy(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIT_DEPLOY, {})
		animation.targetCard = targetCard
		return animation
	}

	public static unitMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.UNIT_MOVE, {})
	}

	public static cardReceivedBuff(targetCards: ServerCard[], alignment: BuffAlignment): ServerAnimation {
		const params: CardReceivedBuffAnimParams = {
			alignment: alignment
		}
		const animation = new ServerAnimation(AnimationType.CARD_RECEIVED_BUFF, params)
		animation.targetCards = targetCards
		return animation
	}
}
