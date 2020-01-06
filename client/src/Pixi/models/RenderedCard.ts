import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import Vector2D from '@/shared/models/Vector2D'
import Point = PIXI.Point

export default class RenderedCard extends Card {
	readonly sprite: PIXI.Sprite
	readonly hitboxSprite: PIXI.Sprite

	constructor(id: string, cardClass: string, sprite: PIXI.Sprite, hitboxSprite: PIXI.Sprite) {
		super(id, cardClass)
		this.sprite = sprite
		this.hitboxSprite = hitboxSprite
		Core.renderer.registerCard(this, sprite, this.hitboxSprite)
	}

	public checkIfHovered(mousePosition: Point): boolean {
		return this.hitboxSprite.containsPoint(mousePosition)
	}

	public updatePositionInHand(handPosition: number, handSize: number): void {
		const sprite = this.sprite
		const hitboxSprite = this.hitboxSprite

		sprite.scale.set(0.5, 0.5)

		const screenWidth = Core.renderer.pixi.view.width
		const screenHeight = Core.renderer.pixi.view.height
		const screenCenter = screenWidth / 2
		const cardWidth = hitboxSprite.width * Math.pow(0.90, handSize)
		const cardHeight = hitboxSprite.height * 0.5
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = screenHeight - cardHeight + Math.abs(distanceToCenter) * 10 + 100
		sprite.rotation = distanceToCenter / 20
		sprite.zIndex = handPosition

		hitboxSprite.position.x = distanceToCenter * cardWidth + screenCenter
		hitboxSprite.position.y = screenHeight - cardHeight + Math.abs(distanceToCenter) * 10 + 100
		hitboxSprite.rotation = distanceToCenter / 20
		hitboxSprite.zIndex = handPosition
	}

	public updatePositionInHandHovered(handPosition: number, handSize: number): void {
		const sprite = this.sprite
		const hitboxSprite = this.hitboxSprite

		sprite.scale.set(0.9, 0.9)

		const screenWidth = Core.renderer.pixi.view.width
		const screenHeight = Core.renderer.pixi.view.height
		const screenCenter = screenWidth / 2
		const cardWidth = hitboxSprite.width * Math.pow(0.90, handSize)
		const cardHeight = hitboxSprite.height * 0.5
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = screenHeight - sprite.height * 0.5
		sprite.rotation = 0
		sprite.zIndex = 50

		hitboxSprite.position.x = distanceToCenter * cardWidth + screenCenter
		hitboxSprite.position.y = screenHeight - cardHeight + Math.abs(distanceToCenter) * 10 + 100
		hitboxSprite.rotation = distanceToCenter / 20
		hitboxSprite.zIndex = handPosition
	}

	public updatePositionIfCardGrabbed(mousePosition: Point): void {
		const sprite = this.sprite

		sprite.position.x = mousePosition.x
		sprite.position.y = mousePosition.y
		sprite.rotation = 0
	}

	public static fromCard(card: Card): RenderedCard {
		const texture = PIXI.Texture.from(`assets/cards/${card.cardClass}.png`)
		const sprite = new PIXI.Sprite(texture)
		const hitboxSprite = new PIXI.Sprite(sprite.texture)
		sprite.scale.set(0.5, 0.5)
		sprite.anchor.set(0.5, 0.5)
		hitboxSprite.scale.set(0.5, 0.5)
		hitboxSprite.anchor.set(0.5, 0.5)
		hitboxSprite.alpha = 0
		return new RenderedCard(card.id, card.cardClass, sprite, hitboxSprite)
	}
}
