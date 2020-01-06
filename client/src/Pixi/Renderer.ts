import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class Renderer {
	pixi: PIXI.Application
	cards: RenderedCard[] = []
	hoveredCard: RenderedCard | null = null
	hoveredCardContainer: PIXI.Container = new PIXI.Container()
	isCardGrabbed: boolean = false

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

		if (!this.isCardGrabbed) {
			this.hoveredCard = null
		}

		sortedCards.forEach(renderedCard => {
			const isHovered = renderedCard.checkIfHovered(Core.input.mousePosition)
			if (isHovered && !this.hoveredCard) {
				this.hoveredCard = renderedCard
				renderedCard.updatePositionInHandHovered(playerCards.indexOf(renderedCard), sortedCards.length)
			} else {
				renderedCard.updatePositionInHand(playerCards.indexOf(renderedCard), sortedCards.length)
			}
		})

		if (!this.hoveredCard && this.hoveredCardContainer.children.length > 0) {
			this.hoveredCardContainer.removeChild(this.hoveredCardContainer.children[0])
		}

		if (this.isCardGrabbed && this.hoveredCard) {
			this.hoveredCard.updatePositionIfCardGrabbed(Core.input.mousePosition)
		}
	}

	public grabCard(): void {
		if (!this.hoveredCard) { return }

		this.isCardGrabbed = true
	}

	public releaseCard(): void {
		this.isCardGrabbed = false
	}

	public registerCard(renderedCard: RenderedCard, sprite: PIXI.Sprite, hitboxSprite: PIXI.Sprite): void {
		this.cards.push(renderedCard)
		this.pixi.stage.addChild(sprite)
		this.pixi.stage.addChild(hitboxSprite)
	}
}
