import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class MainHandler {
	cards: RenderedCard[] = []

	// constructor() {
	// PIXI.Ticker.shared.add(MainHandler.tick)
	// setInterval(() => {
	// 	MainHandler.tick()
	// }, 4)
	// }

	private static tick(): void {
		Core.input.updateCardHoverStatus()
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
