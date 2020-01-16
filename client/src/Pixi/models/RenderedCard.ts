import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import CardType from '@/shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Point = PIXI.Point
import IPoint = PIXI.IPoint

const FONT_RENDER_SCALE = 1.5

export default class RenderedCard extends Card {
	public coreContainer: PIXI.Container
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	private readonly cardModeContainer: PIXI.Container
	private readonly unitModeContainer: PIXI.Container

	private readonly powerText: PIXI.Text
	private readonly attackText: PIXI.Text

	constructor(card: Card) {
		super(card.id, card.cardType, card.cardClass)
		this.power = card.power
		this.attack = card.attack
		this.basePower = card.basePower
		this.baseAttack = card.baseAttack

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.cardClass}`))
		this.powerText = this.createPowerText()
		this.attackText = this.createAttackText()
		this.hitboxSprite = this.createHitboxSprite(this.sprite)

		this.sprite.anchor.set(0.5)

		/* Internal container */
		const internalContainer = new PIXI.Container()
		internalContainer.position.x = -this.sprite.texture.width / 2
		internalContainer.position.y = -this.sprite.texture.height / 2
		this.sprite.addChild(internalContainer)

		/* Card mode container */
		this.cardModeContainer = new PIXI.Container()
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power')))
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-name')))
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description')))
		internalContainer.addChild(this.cardModeContainer)

		/* Unit mode container */
		this.unitModeContainer = new PIXI.Container()
		this.unitModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom')))
		internalContainer.addChild(this.unitModeContainer)

		/* Core container */
		this.coreContainer = new PIXI.Container()
		this.coreContainer.addChild(this.sprite)
		this.coreContainer.addChild(this.powerText)
		this.coreContainer.addChild(this.attackText)
		this.coreContainer.position.set(-1000, -1000)
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

	public setDisplayMode(displayMode: CardDisplayMode): void {
		if (this.displayMode === displayMode) {
			return
		}

		this.displayMode = displayMode
		this.powerText.scale.set(1 / FONT_RENDER_SCALE)

		if (displayMode === CardDisplayMode.IN_HAND || displayMode === CardDisplayMode.IN_HAND_HOVERED || displayMode === CardDisplayMode.INSPECTED) {
			this.switchToCardMode()
		} else if (displayMode === CardDisplayMode.ON_BOARD) {
			this.switchToUnitMode()
		} else if (displayMode === CardDisplayMode.IN_HAND_HIDDEN) {
			this.switchToHiddenMode()
		}

		this.powerText.position.x *= this.sprite.scale.x
		this.powerText.position.y *= this.sprite.scale.y
		this.powerText.position.x -= this.sprite.width / 2
		this.powerText.position.y -= this.sprite.height / 2
		this.powerText.style.fontSize *= this.sprite.scale.x
		this.powerText.style.fontSize *= FONT_RENDER_SCALE
	}

	public switchToCardMode(): void {
		this.cardModeContainer.alpha = 1
		this.unitModeContainer.alpha = 0

		this.powerText.position.set(60, 45)
		this.powerText.style.fontSize = 71

		this.attackText.position.set(0, 0)
	}

	public switchToUnitMode(): void {
		this.unitModeContainer.alpha = 1
		this.cardModeContainer.alpha = 0

		this.powerText.position.set(97, 80)
		this.powerText.style.fontSize = 135

		this.attackText.position.set(0, 0)
	}

	public switchToHiddenMode(): void {
		this.cardModeContainer.alpha = 0
		this.unitModeContainer.alpha = 0
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
