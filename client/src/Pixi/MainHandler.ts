import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class MainHandler {
	cards: RenderedCard[] = []

	constructor() {
		PIXI.Ticker.shared.add(MainHandler.tick)
	}

	private static tick(): void {
		const sortedCards = Core.player.cardHand.cards.slice().reverse()

		if (!Core.input.grabbedCard) {
			Core.input.hoveredCard = sortedCards.find(card => card.isHovered(Core.input.mousePosition)) || null
		}
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
