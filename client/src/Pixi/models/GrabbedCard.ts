import RenderedCard from '@/Pixi/cards/RenderedCard'
import TargetingLine from '@/Pixi/models/TargetingLine'
import { GrabbedCardMode } from '@/Pixi/enums/GrabbedCardMode'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'

export default class GrabbedCard {
	card: RenderedCard
	mode: GrabbedCardMode
	grabTimestamp: number
	grabPosition: PIXI.Point
	targetingLine: TargetingLine
	validTargetCards?: RenderedCard[]
	validTargetRows?: RenderedGameBoardRow[]

	constructor(card: RenderedCard, mode: GrabbedCardMode) {
		this.card = card
		this.mode = mode
		this.targetingLine = new TargetingLine()
		this.targetingLine.create()
		this.grabTimestamp = performance.now()
		this.grabPosition = Core.input.mousePosition.clone()
	}

	public shouldStick(): boolean {
		const mousePosition = Core.input.mousePosition
		const grabPosition = this.grabPosition
		const distance = Math.sqrt(Math.pow(mousePosition.x - grabPosition.x, 2) + Math.pow(mousePosition.y - grabPosition.y, 2))
		return distance <= 15 && (performance.now() - this.grabTimestamp) <= 150
	}

	public isLongClicked(): boolean {
		const mousePosition = Core.input.mousePosition
		const grabPosition = this.grabPosition
		const distance = Math.sqrt(Math.pow(mousePosition.x - grabPosition.x, 2) + Math.pow(mousePosition.y - grabPosition.y, 2))
		return distance <= 50 && performance.now() - this.grabTimestamp >= 1000
	}

	public static cardPlay(card: RenderedCard, validTargetRows: RenderedGameBoardRow[]): GrabbedCard {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_PLAY)
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}

	public static cardOrder(card: RenderedCard, validTargetCards: RenderedCard[], validTargetRows: RenderedGameBoardRow[]): GrabbedCard {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_ORDER)
		grabbedCard.validTargetCards = validTargetCards
		grabbedCard.validTargetRows = validTargetRows
		return grabbedCard
	}

	public static cardSelect(card: RenderedCard): GrabbedCard {
		const grabbedCard = new GrabbedCard(card, GrabbedCardMode.CARD_SELECT)
		grabbedCard.validTargetCards = [card]
		grabbedCard.validTargetRows = []
		return grabbedCard
	}
}
