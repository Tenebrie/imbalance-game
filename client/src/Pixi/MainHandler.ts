import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import HoveredCard from '@/Pixi/models/HoveredCard'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class MainHandler {
	cards: RenderedCard[] = []

	constructor() {
		PIXI.Ticker.shared.add(MainHandler.tick)
	}

	private static tick(): void {
		MainHandler.tickCardHover()
	}

	private static tickCardHover(): void {
		const gameBoardCards = Core.gameBoard.rows.map(row => row.cards).flat()
		const playerHandCards = Core.player.cardHand.cards.slice().reverse()

		let hoveredCard: HoveredCard | null = null

		const hoveredCardOnBoard = gameBoardCards.find(cardOnBoard => cardOnBoard.card.isHovered(Core.input.mousePosition)) || null
		if (hoveredCardOnBoard) {
			hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard)
		}

		const hoveredCardInHand = playerHandCards.find(card => card.isHovered(Core.input.mousePosition)) || null
		if (hoveredCardInHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInHand, Core.player)
		}

		Core.input.hoveredCard = hoveredCard
	}

	public registerCard(renderedCard: RenderedCard): void {
		this.cards.push(renderedCard)
	}

	public unregisterCard(targetCard: RenderedCard): void {
		this.cards = this.cards.filter(card => card !== targetCard)
	}

	public static start(): MainHandler {
		return new MainHandler()
	}

	public stop(): void {
		PIXI.Ticker.shared.remove(MainHandler.tick)
	}
}
