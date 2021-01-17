import Animation from '@shared/models/Animation'
import ServerUnit from './ServerUnit'
import AnimationType from '@shared/enums/AnimationType'
import ServerCard from './ServerCard'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'
import CardAnnounceAnimParams from '@shared/models/animations/CardAnnounceAnimParams'
import Card from '@shared/models/Card'
import Unit from '@shared/models/Unit'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import DelayAnimParams from '@shared/models/animations/DelayAnimParams'

export default class ServerAnimation implements Animation {
	type: AnimationType
	sourceCard: Card | null
	sourceUnit: Unit | null
	targetCard: Card | null
	targetCards: Card[] | null
	params: any

	constructor(type: AnimationType, params: Record<string, any>) {
		this.type = type
		this.params = params
		this.sourceCard = null
		this.sourceUnit = null
		this.targetCard = null
		this.targetCards = null
	}

	public static null(): ServerAnimation {
		return new ServerAnimation(AnimationType.NULL, {})
	}

	public static delay(ms: number): ServerAnimation {
		const params: DelayAnimParams = { delay: ms }
		return new ServerAnimation(AnimationType.DELAY, params)
	}

	public static cardDraw(): ServerAnimation {
		return new ServerAnimation(AnimationType.CARD_DRAW, {})
	}

	public static cardAnnounce(targetCard: ServerCard): ServerAnimation {
		const params: CardAnnounceAnimParams = {
			cardMessage: new OpenCardMessage(targetCard),
		}
		const animation = new ServerAnimation(AnimationType.CARD_ANNOUNCE, params)
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

	public static cardHealsCards(sourceCard: ServerCard, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_HEAL, {})
		animation.sourceCard = sourceCard
		animation.targetCards = targetCards
		return animation
	}

	public static universeAttacksCards(targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_ATTACK, {})
		animation.targetCards = targetCards
		return animation
	}

	public static universeAttacksUnits(targetUnits: ServerUnit[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_ATTACK, {})
		animation.targetCards = targetUnits.map((unit) => unit.card)
		return animation
	}

	public static universeAffectsCards(targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_AFFECT, {})
		animation.targetCards = targetCards
		return animation
	}

	public static universeHealsCards(targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIVERSE_HEAL, {})
		animation.targetCards = targetCards
		return animation
	}

	public static unitDeploy(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIT_DEPLOY, {})
		animation.targetCard = targetCard
		return animation
	}

	public static unitDestroy(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.UNIT_DESTROY, {})
		animation.targetCard = targetCard
		return animation
	}

	public static unitMove(): ServerAnimation {
		return new ServerAnimation(AnimationType.UNIT_MOVE, {})
	}

	public static cardsReceivedBuff(targetCards: ServerCard[], alignment: BuffAlignment): ServerAnimation {
		const params: CardReceivedBuffAnimParams = {
			alignment: alignment,
		}
		const animation = new ServerAnimation(AnimationType.CARD_RECEIVED_BUFF, params)
		animation.targetCards = targetCards
		return animation
	}

	public static cardInfuse(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_INFUSE, {})
		animation.targetCard = targetCard
		return animation
	}

	public static cardGenerateMana(targetCard: ServerCard): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_GENERATE_MANA, {})
		animation.targetCard = targetCard
		return animation
	}
}
