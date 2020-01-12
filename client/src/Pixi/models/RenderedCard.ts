import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import CardType from '@/shared/enums/CardType'
import Point = PIXI.Point
import IPoint = PIXI.IPoint

export default class RenderedCard extends Card {
	sprite: PIXI.Sprite
	hitboxSprite: PIXI.Sprite

	constructor(card: Card) {
		super(card.id, card.cardType, card.cardClass)
		this.attack = card.attack
		this.health = card.health
		this.initiative = card.initiative
		this.baseAttack = card.baseAttack
		this.baseHealth = card.baseHealth
		this.baseInitiative = card.baseInitiative

		this.sprite = this.createSprite()
		this.hitboxSprite = this.createHitboxSprite(this.sprite)
		Core.registerCard(this)
	}

	public getPosition(): IPoint {
		return this.hitboxSprite.position
	}

	public isHovered(mousePosition: Point): boolean {
		return this.hitboxSprite.containsPoint(mousePosition)
	}

	public reveal(cardType: CardType, cardClass: string): void {
		Core.unregisterCard(this)
		this.cardType = cardType
		this.cardClass = cardClass
		this.sprite = this.createSprite()
		Core.registerCard(this)
	}

	public unregister(): void {
		Core.unregisterCard(this)
	}

	public createSprite(): PIXI.Sprite {
		const texture = PIXI.Texture.from(`assets/cards/${this.cardClass}.png`)
		const sprite = new PIXI.Sprite(texture)
		texture.baseTexture.on('loaded', () => {
			sprite.alpha = 0
		})
		sprite.scale.set(0.5, 0.5)
		sprite.anchor.set(0.5, 0.5)
		sprite.alpha = 0
		sprite.tint = 0xFFFFFF
		return sprite
	}

	public createHitboxSprite(sprite: PIXI.Sprite): PIXI.Sprite {
		const hitboxSprite = new PIXI.Sprite(sprite.texture)
		sprite.texture.baseTexture.on('loaded', () => {
			hitboxSprite.alpha = 0
		})
		hitboxSprite.scale.set(0.5, 0.5)
		hitboxSprite.anchor.set(0.5, 0.5)
		hitboxSprite.position.set(-1000, -1000)
		hitboxSprite.tint = 0xAA5555
		hitboxSprite.zIndex = -1
		return hitboxSprite
	}

	public static fromCard(card: Card): RenderedCard {
		return new RenderedCard(card)
	}
}
