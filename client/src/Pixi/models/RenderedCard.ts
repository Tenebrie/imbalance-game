import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import Vector2D from '@/shared/models/Vector2D'
import Point = PIXI.Point

export default class RenderedCard extends Card {
	readonly sprite: PIXI.Sprite

	constructor(id: string, cardClass: string, sprite: PIXI.Sprite) {
		super(id, cardClass)
		this.sprite = sprite
		Core.renderer.registerCard(this, sprite)
	}

	public checkIfHovered(mousePosition: Point): boolean {
		return this.sprite.containsPoint(mousePosition)
	}

	public updatePositionInHand(sprite: PIXI.Sprite, handPosition: number, handSize: number): void {
		sprite.alpha = 1
		sprite.scale.set(0.4, 0.4)

		const screenWidth = Core.renderer.pixi.view.width
		const screenHeight = Core.renderer.pixi.view.height
		const screenCenter = screenWidth / 2
		const cardWidth = sprite.width * Math.pow(0.90, handSize)
		const cardHeight = sprite.height * 0.25
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = screenHeight - cardHeight
		sprite.rotation = distanceToCenter / 20
		sprite.zIndex = handPosition
	}

	public updatePositionInHandHovered(sprite: PIXI.Sprite, hoverSprite: PIXI.Sprite, handPosition: number, handSize: number): void {
		sprite.alpha = 0
		sprite.scale.set(0.4, 0.4)

		const screenWidth = Core.renderer.pixi.view.width
		const screenHeight = Core.renderer.pixi.view.height
		const screenCenter = screenWidth / 2
		const cardWidth = sprite.width * Math.pow(0.90, handSize)
		const cardHeight = sprite.height * 0.25
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = screenHeight - cardHeight
		sprite.rotation = distanceToCenter / 20
		sprite.zIndex = handPosition

		hoverSprite.anchor.set(0.5, 0.5)
		hoverSprite.position.x = distanceToCenter * cardWidth + screenCenter
		hoverSprite.position.y = screenHeight - hoverSprite.height / 2
		hoverSprite.rotation = 0
	}

	public static fromCard(card: Card): RenderedCard {
		const texture = PIXI.Texture.from(`assets/cards/${card.cardClass}.png`)
		const sprite = new PIXI.Sprite(texture)
		sprite.anchor.set(0.5, 0.5)
		sprite.scale.set(0.4, 0.4)
		return new RenderedCard(card.id, card.cardClass, sprite)
	}
}
