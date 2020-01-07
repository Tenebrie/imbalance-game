import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import Point = PIXI.Point

export default class RenderedCard extends Card {
	readonly sprite: PIXI.Sprite
	readonly hitboxSprite: PIXI.Sprite

	constructor(id: string, cardClass: string, sprite: PIXI.Sprite, hitboxSprite: PIXI.Sprite) {
		super(id, cardClass)
		this.sprite = sprite
		this.hitboxSprite = hitboxSprite
		Core.registerCard(this)
	}

	public isHovered(mousePosition: Point): boolean {
		return this.hitboxSprite.containsPoint(mousePosition)
	}

	public static fromCard(card: Card): RenderedCard {
		const texture = PIXI.Texture.from(`assets/cards/${card.cardClass}.png`)
		const sprite = new PIXI.Sprite(texture)
		const hitboxSprite = new PIXI.Sprite(sprite.texture)
		texture.baseTexture.on('loaded', () => {
			sprite.alpha = 0
			hitboxSprite.alpha = 0
		})
		sprite.scale.set(0.5, 0.5)
		sprite.anchor.set(0.5, 0.5)
		sprite.alpha = 0
		sprite.tint = 0xFFFFFF
		hitboxSprite.scale.set(0.5, 0.5)
		hitboxSprite.anchor.set(0.5, 0.5)
		hitboxSprite.position.set(-1000, -1000)
		// hitboxSprite.alpha = 0.5
		hitboxSprite.tint = 0xAA5555
		hitboxSprite.zIndex = -1

		return new RenderedCard(card.id, card.cardClass, sprite, hitboxSprite)
	}
}
