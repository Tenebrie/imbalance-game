import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class Renderer {
	pixi: PIXI.Application
	cards: RenderedCard[] = []
	hoveredCardContainer: PIXI.Container = new PIXI.Container()

	constructor(container: Element) {
		this.pixi = new PIXI.Application({ width: 1024, height: 1024 })
		this.pixi.stage.sortableChildren = true
		container.appendChild(this.pixi.view)

		this.pixi.stage.addChild(this.hoveredCardContainer)
		this.hoveredCardContainer.zIndex = 100

		setInterval(() => this.tick(), 15)
	}

	private tick(): void {
		const playerCards = Core.player.cardHand.cards
		let sortedCards = Core.player.cardHand.cards.slice().reverse()

		let hoveredCard: RenderedCard
		sortedCards.forEach(renderedCard => {
			const isHovered = renderedCard.checkIfHovered(Core.input.mousePosition)
			if (isHovered && !hoveredCard) {
				hoveredCard = renderedCard

				if (this.hoveredCardContainer.children.length > 0) {
					this.hoveredCardContainer.removeChild(this.hoveredCardContainer.children[0])
				}
				const hoverSprite = new PIXI.Sprite(hoveredCard.sprite.texture)
				this.hoveredCardContainer.addChild(hoverSprite)

				renderedCard.updatePositionInHandHovered(renderedCard.sprite, hoverSprite, playerCards.indexOf(renderedCard), sortedCards.length)
			} else {
				renderedCard.updatePositionInHand(renderedCard.sprite, playerCards.indexOf(renderedCard), sortedCards.length)
			}
		})

		// @ts-ignore
		if (!hoveredCard && this.hoveredCardContainer.children.length > 0) {
			this.hoveredCardContainer.removeChild(this.hoveredCardContainer.children[0])
		}
	}

	public registerCard(renderedCard: RenderedCard, sprite: PIXI.Sprite): void {
		this.cards.push(renderedCard)
		this.pixi.stage.addChild(sprite)
	}
}
