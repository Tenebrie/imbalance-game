import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'

const CARD_SCALE = 0.3
const HOVERED_CARD_SCALE = 0.7

export default class Renderer {
	pixi: PIXI.Application

	constructor(container: Element) {
		this.pixi = new PIXI.Application({ width: 1024, height: 1024 })
		this.pixi.stage.sortableChildren = true
		container.appendChild(this.pixi.view)

		PIXI.Ticker.shared.add(() => this.tick())
	}

	private tick(): void {
		const playerCards = Core.player.cardHand.cards
		const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse()

		sortedPlayerCards.forEach(renderedCard => {
			if (renderedCard === Core.input.grabbedCard) {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
				this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
			} else if (renderedCard === Core.input.hoveredCard) {
				this.renderHoveredCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
			} else {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
			}
		})

		if (Core.opponent) {
			const opponentCards = Core.opponent.cardHand.cards
			const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse()
			sortedOpponentCards.forEach(renderedCard => {
				this.renderCardInOpponentHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length)
			})
		}
	}

	public registerCard(renderedCard: RenderedCard): void {
		this.pixi.stage.addChild(renderedCard.sprite)
		this.pixi.stage.addChild(renderedCard.hitboxSprite)
	}

	private getScreenWidth(): number {
		return this.pixi.view.width
	}

	private getScreenHeight(): number {
		return this.pixi.view.height
	}

	private getCardDistanceToCenter(handPosition: number, handSize: number): number {
		return handPosition - ((handSize - 1) / 2)
	}

	public renderSpriteInHand(sprite: PIXI.Sprite, handPosition: number, handSize: number, isOpponent: boolean): void {
		sprite.scale.set(CARD_SCALE)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = sprite.width * Math.pow(0.95, handSize)
		const cardHeight = sprite.height * 0.5

		sprite.alpha = 1
		sprite.position.x = this.getCardDistanceToCenter(handPosition, handSize) * cardWidth + screenCenter
		sprite.position.y = cardHeight
		sprite.rotation = 0
		sprite.zIndex = (handPosition + 1) * 2
		if (!isOpponent) {
			sprite.position.y = this.getScreenHeight() - sprite.position.y
		}
	}

	public renderHoveredSpriteInHand(sprite: PIXI.Sprite, handPosition: number, handSize: number): void {
		sprite.scale.set(CARD_SCALE)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = sprite.width * Math.pow(0.95, handSize)
		const cardHeight = (sprite.height / CARD_SCALE) * HOVERED_CARD_SCALE * 0.5

		sprite.alpha = 1
		sprite.scale.set(HOVERED_CARD_SCALE)
		sprite.position.x = this.getCardDistanceToCenter(handPosition, handSize) * cardWidth + screenCenter
		sprite.position.y = this.getScreenHeight() - cardHeight
		sprite.rotation = 0
		sprite.zIndex = 50
	}

	public renderGrabbedSprite(sprite: PIXI.Sprite, mousePosition: Point): void {
		sprite.alpha = 1
		sprite.scale.set(CARD_SCALE)
		sprite.position.x = mousePosition.x
		sprite.position.y = mousePosition.y
		sprite.rotation = 0
		sprite.zIndex = 100
	}

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderSpriteInHand(sprite, handPosition, handSize, false)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false)
		hitboxSprite.zIndex -= 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderHoveredSpriteInHand(sprite, handPosition, handSize)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false)
		hitboxSprite.zIndex -= 1
	}

	public renderGrabbedCard(renderedCard: RenderedCard, mousePosition: Point): void {
		this.renderGrabbedSprite(renderedCard.sprite, mousePosition)
	}

	public renderCardInOpponentHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderSpriteInHand(sprite, handPosition, handSize, true)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, true)
		hitboxSprite.zIndex -= 1
	}
}
