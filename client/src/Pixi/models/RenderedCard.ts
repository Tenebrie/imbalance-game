import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import CardType from '@/shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Point = PIXI.Point
import IPoint = PIXI.IPoint

export default class RenderedCard extends Card {
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	private readonly cardPowerSprite: PIXI.Sprite
	private readonly unitPowerSprite: PIXI.Sprite
	private readonly powerText: PIXI.Text
	private readonly attackText: PIXI.Text

	constructor(card: Card) {
		super(card.id, card.cardType, card.cardClass)
		this.power = card.power
		this.attack = card.attack
		this.basePower = card.basePower
		this.baseAttack = card.baseAttack

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.cardClass}`))
		this.cardPowerSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power'))
		this.unitPowerSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom'))
		this.powerText = this.createPowerText()
		this.attackText = this.createAttackText()
		this.hitboxSprite = this.createHitboxSprite(this.sprite)

		const container = new PIXI.Container()
		container.position.x = -this.sprite.texture.width / 2
		container.position.y = -this.sprite.texture.height / 2 - 1
		container.addChild(this.cardPowerSprite)
		container.addChild(this.unitPowerSprite)
		container.addChild(this.powerText)
		container.addChild(this.attackText)

		this.sprite.addChild(container)

		this.sprite.alpha = 0
		this.sprite.anchor.set(0.5)
	}

	public getPosition(): IPoint {
		return this.hitboxSprite.position
	}

	public isHovered(mousePosition: Point): boolean {
		return this.hitboxSprite.containsPoint(mousePosition)
	}

	public setPower(value: number): void {
		this.power = value
		this.powerText.text = value.toString()
	}

	public setAttack(value: number): void {
		this.attack = value
		this.attackText.text = value.toString()
	}

	public reveal(cardType: CardType, cardClass: string): void {
		Core.unregisterCard(this)
		this.cardType = cardType
		this.cardClass = cardClass
		Core.registerCard(this)
	}

	public createHitboxSprite(sprite: PIXI.Sprite): PIXI.Sprite {
		const hitboxSprite = new PIXI.Sprite(sprite.texture)
		hitboxSprite.alpha = 0
		hitboxSprite.anchor.set(0.5)
		hitboxSprite.tint = 0xAA5555
		hitboxSprite.zIndex = -1
		return hitboxSprite
	}

	public createPowerText(): PIXI.Text {
		const text = this.power ? this.power.toString() : ''
		const textObject = new PIXI.Text(text, {
			fontFamily: 'BrushScript',
			fill: 0x000000,
			padding: 16
		})
		textObject.anchor.set(0.5)
		return textObject
	}

	public createAttackText(): PIXI.Text {
		const text = this.attack ? this.attack.toString() : ''
		const textObject = new PIXI.Text(text, {
			fontFamily: 'BrushScript',
			fill: 0xFF0000
		})
		textObject.anchor.set(0.5)
		return textObject
	}

	public switchToCardMode(): void {
		if (this.displayMode === CardDisplayMode.CARD) {
			return
		}

		this.displayMode = CardDisplayMode.CARD
		this.cardPowerSprite.alpha = 1
		this.unitPowerSprite.alpha = 0
		this.powerText.position.set(60, 42)
		this.attackText.position.set(40, 550)
	}

	public switchToUnitMode(): void {
		if (this.displayMode === CardDisplayMode.UNIT) {
			return
		}

		this.displayMode = CardDisplayMode.UNIT
		this.unitPowerSprite.alpha = 1
		this.cardPowerSprite.alpha = 0

		this.powerText.position.set(100, 80)
		this.attackText.position.set(40, 550)
	}

	public fixFontScaling(): void {
		let powerTextFontSize = 70
		let attackTextFontSize = 70
		if (this.displayMode === CardDisplayMode.UNIT) {
			powerTextFontSize = 150
			attackTextFontSize = 96
		}

		this.powerText.scale.set(1 / this.sprite.scale.x)
		this.powerText.style.fontSize = Math.round(powerTextFontSize * this.sprite.scale.x)
		this.attackText.scale.set(1 / this.sprite.scale.x)
		this.attackText.style.fontSize = Math.round(attackTextFontSize * this.sprite.scale.x)
	}

	public unregister(): void {
		Core.unregisterCard(this)
	}

	public static fromCard(card: Card): RenderedCard {
		const renderedCard = new RenderedCard(card)
		Core.registerCard(renderedCard)
		return renderedCard
	}
}
