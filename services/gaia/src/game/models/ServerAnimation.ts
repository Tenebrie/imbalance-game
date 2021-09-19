import AnimationType from '@shared/enums/AnimationType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import Animation from '@shared/models/Animation'
import CardAnnounceAnimParams from '@shared/models/animations/CardAnnounceAnimParams'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'
import DelayAnimParams from '@shared/models/animations/DelayAnimParams'
import RowReceivedBuffAnimParams from '@shared/models/animations/RowReceivedBuffAnimParams'
import BoardRow from '@shared/models/BoardRow'
import Card from '@shared/models/Card'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import Unit from '@shared/models/Unit'

import ServerBoardRow from './ServerBoardRow'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'

export default class ServerAnimation implements Animation {
	type: AnimationType
	sourceCard: Card | null
	sourceUnit: Unit | null
	sourceRow: BoardRow | null
	targetCard: Card | null
	targetCards: Card[] | null
	targetRows: BoardRow[] | null
	params: any

	constructor(type: AnimationType, params: Record<string, any>) {
		this.type = type
		this.params = params
		this.sourceCard = null
		this.sourceUnit = null
		this.sourceRow = null
		this.targetCard = null
		this.targetCards = null
		this.targetRows = null
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

	public static clearAnnouncedCard(targetCard: ServerCard): ServerAnimation {
		const params: CardAnnounceAnimParams = {
			cardMessage: new OpenCardMessage(targetCard),
		}
		const animation = new ServerAnimation(AnimationType.CARD_ANNOUNCE_CLEAR, params)
		animation.targetCard = targetCard
		return animation
	}

	public static cardAttacksCards(sourceCard: ServerCard, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_ATTACK, {})
		animation.sourceCard = sourceCard
		animation.targetCards = targetCards
		return animation
	}

	public static rowAttacksCards(sourceRow: ServerBoardRow, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.ROW_ATTACK, {})
		animation.sourceRow = sourceRow
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

	public static cardAffectsRows(sourceCard: ServerCard, targetRows: ServerBoardRow[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.CARD_AFFECTS_ROWS, {})
		animation.sourceCard = sourceCard
		animation.targetRows = targetRows
		return animation
	}

	public static rowAffectsCards(sourceRow: ServerBoardRow, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.ROW_AFFECTS_CARDS, {})
		animation.sourceRow = sourceRow
		animation.targetCards = targetCards
		return animation
	}

	public static rowHealsCards(sourceRow: ServerBoardRow, targetCards: ServerCard[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.ROW_HEALS_CARDS, {})
		animation.sourceRow = sourceRow
		animation.targetCards = targetCards
		return animation
	}

	public static rowAffectsRows(sourceRow: ServerBoardRow, targetRows: ServerBoardRow[]): ServerAnimation {
		const animation = new ServerAnimation(AnimationType.ROW_AFFECTS_ROWS, {})
		animation.sourceRow = sourceRow
		animation.targetRows = targetRows
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

	public static rowsReceivedBuff(targetRows: ServerBoardRow[], alignment: BuffAlignment): ServerAnimation {
		const params: RowReceivedBuffAnimParams = {
			alignment: alignment,
		}
		const animation = new ServerAnimation(AnimationType.ROWS_RECEIVED_BUFF, params)
		animation.targetRows = targetRows
		return animation
	}

	public static cardsLostBuff(targetCards: ServerCard[], alignment: BuffAlignment): ServerAnimation {
		const params: CardReceivedBuffAnimParams = {
			alignment: alignment,
		}
		const animation = new ServerAnimation(AnimationType.CARDS_LOST_BUFF, params)
		animation.targetCards = targetCards
		return animation
	}

	public static rowsLostBuff(targetRows: ServerBoardRow[], alignment: BuffAlignment): ServerAnimation {
		const params: RowReceivedBuffAnimParams = {
			alignment: alignment,
		}
		const animation = new ServerAnimation(AnimationType.ROWS_LOST_BUFF, params)
		animation.targetRows = targetRows
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

	public static switchingGames(): ServerAnimation {
		return new ServerAnimation(AnimationType.SWITCHING_GAMES, {})
	}
}
