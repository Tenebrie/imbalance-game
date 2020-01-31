import RenderedCard from '@/Pixi/board/RenderedCard'
import TargetingLine from '@/Pixi/models/TargetingLine'
import {TargetingMode} from '@/Pixi/enums/TargetingMode'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'

export default class GrabbedCard {
	card: RenderedCard
	targetingMode: TargetingMode
	targetingLine: TargetingLine
	validTargetCards?: RenderedCard[]
	validTargetRows?: RenderedGameBoardRow[]

	constructor(card: RenderedCard, targetingMode: TargetingMode) {
		this.card = card
		this.targetingMode = targetingMode
		this.targetingLine = new TargetingLine()
		this.targetingLine.create()
	}

	public static cardPlay(card: RenderedCard, validTargetRows: RenderedGameBoardRow[]) {
		const grabbedCard = new GrabbedCard(card, TargetingMode.CARD_PLAY)
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}

	public static cardOrder(card: RenderedCard, validTargetCards: RenderedCard[], validTargetRows: RenderedGameBoardRow[]) {
		const grabbedCard = new GrabbedCard(card, TargetingMode.CARD_ORDER)
		grabbedCard.validTargetCards = validTargetCards
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}
}
