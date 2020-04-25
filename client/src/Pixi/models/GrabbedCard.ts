import RenderedCard from '@/Pixi/board/RenderedCard'
import TargetingLine from '@/Pixi/models/TargetingLine'
import { GrabbedCardMode } from '@/Pixi/enums/GrabbedCardMode'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'

export default class GrabbedCard {
	card: RenderedCard
	mode: GrabbedCardMode
	targetingLine: TargetingLine
	validTargetCards?: RenderedCard[]
	validTargetRows?: RenderedGameBoardRow[]

	constructor(card: RenderedCard, mode: GrabbedCardMode) {
		this.card = card
		this.mode = mode
		this.targetingLine = new TargetingLine()
		this.targetingLine.create()
	}

	public static cardPlay(card: RenderedCard, validTargetRows: RenderedGameBoardRow[]) {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_PLAY)
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}

	public static cardOrder(card: RenderedCard, validTargetCards: RenderedCard[], validTargetRows: RenderedGameBoardRow[]) {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_ORDER)
		grabbedCard.validTargetCards = validTargetCards
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}

	public static cardSelect(card: RenderedCard) {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_SELECT)
		grabbedCard.validTargetCards = [card]
		grabbedCard.validTargetRows = []
		return grabbedCard
	}
}
