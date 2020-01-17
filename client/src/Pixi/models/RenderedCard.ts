import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/shared/models/Card'
import CardType from '@/shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Localization from '@/Pixi/Localization'
import Settings from '@/Pixi/Settings'
import Point = PIXI.Point
import IPoint = PIXI.IPoint

export default class RenderedCard extends Card {
	public coreContainer: PIXI.Container
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	private readonly cardModeContainer: PIXI.Container
	private readonly unitModeContainer: PIXI.Container
	private readonly cardModeTextContainer: PIXI.Container

	private readonly powerText: PIXI.Text
	private readonly attackText: PIXI.Text
	private readonly cardNameText: PIXI.Text
	private readonly cardTitleText: PIXI.Text
	private readonly cardDescriptionText: PIXI.Text

	constructor(card: Card) {
		super(card.id, card.cardType, card.cardClass)

		this.cardName = card.cardName
		this.cardTitle = card.cardTitle
		this.cardDescription = card.cardDescription

		this.power = card.power
		this.attack = card.attack
		this.basePower = card.basePower
		this.baseAttack = card.baseAttack

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.cardClass}`))
		this.powerText = this.createStatText(this.power ? this.power.toString() : '')
		this.attackText = this.createStatText(this.attack ? this.attack.toString() : '')
		this.cardNameText = this.createCardNameText(Localization.getString(this.cardName))
		this.cardTitleText = this.createCardNameText(Localization.getString(this.cardTitle))
		this.cardDescriptionText = this.createCardDescriptionText(Localization.getString(this.cardDescription))
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

		/* Card mode text container */
		this.cardModeTextContainer = new PIXI.Container()
		this.cardModeTextContainer.addChild(this.cardNameText)
		this.cardModeTextContainer.addChild(this.cardTitleText)
		this.cardModeTextContainer.addChild(this.cardDescriptionText)
		this.coreContainer.addChild(this.cardModeTextContainer)
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

	public createStatText(text: string): PIXI.Text {
		const textObject = new PIXI.Text(text, {
			fontFamily: 'BrushScript',
			fill: 0x000000,
			padding: 16
		})
		textObject.anchor.set(0.5)
		return textObject
	}

	public createCardNameText(text: string): PIXI.Text {
		const textObject = new PIXI.Text(text, {
			fontFamily: 'Arial',
			fill: 0x000000,
			padding: 16,
			align: 'right'
		})
		textObject.anchor.set(1, 0.5)
		return textObject
	}

	public createCardDescriptionText(text: string): PIXI.Text {
		const textObject = new PIXI.Text(text, {
			fontFamily: 'Arial',
			fill: 0xCCCCCC,
			padding: 16,
			align: 'center'
		})
		textObject.anchor.set(0.5)
		return textObject
	}

	public setDisplayMode(displayMode: CardDisplayMode): void {
		if (this.displayMode === displayMode) {
			return
		}

		this.displayMode = displayMode

		if (displayMode === CardDisplayMode.IN_HAND || displayMode === CardDisplayMode.IN_HAND_HOVERED || displayMode === CardDisplayMode.INSPECTED) {
			this.switchToCardMode()
		} else if (displayMode === CardDisplayMode.ON_BOARD) {
			this.switchToUnitMode()
		} else if (displayMode === CardDisplayMode.IN_HAND_HIDDEN) {
			this.switchToHiddenMode()
		}

		const texts = [
			this.powerText,
			this.attackText,
			this.cardNameText,
			this.cardTitleText,
			this.cardDescriptionText
		].filter(text => text.text.length > 0)

		texts.forEach(text => {
			text.position.x *= this.sprite.scale.x
			text.position.y *= this.sprite.scale.y
			text.position.x = Math.round(text.position.x)
			text.position.y = Math.round(text.position.y)

			text.scale.set(1 / Settings.fontRenderScale)
			text.style.fontSize *= this.sprite.scale.x
			text.style.lineHeight *= this.sprite.scale.x
			text.style.fontSize *= Settings.fontRenderScale
			text.style.lineHeight *= Settings.fontRenderScale
		})

		this.powerText.position.x -= this.sprite.width / 2
		this.powerText.position.y -= this.sprite.height / 2
		this.cardNameText.position.x += this.sprite.width / 2
		this.cardNameText.position.y -= this.sprite.height / 2
		this.cardTitleText.position.x += this.sprite.width / 2
		this.cardTitleText.position.y -= this.sprite.height / 2
		this.cardDescriptionText.position.y += this.sprite.height / 2
	}

	public switchToCardMode(): void {
		this.unitModeContainer.alpha = 0
		this.cardModeContainer.alpha = 1
		this.cardModeTextContainer.alpha = 1

		this.powerText.position.set(60, 45)
		this.powerText.style.fontSize = 71

		this.attackText.position.set(0, 0)
		this.attackText.style.fontSize = 71

		this.cardNameText.position.set(-10, 67)
		this.cardNameText.style.fontSize = 22

		if (this.cardTitleText.text.length > 0) {
			this.cardNameText.position.y -= 12
			this.cardTitleText.position.set(-10, 82)
			this.cardTitleText.style.fontSize = 20
		}

		this.cardDescriptionText.position.set(0, -135)
		this.cardDescriptionText.style.fontSize = 18
		this.cardDescriptionText.style.lineHeight = 24
	}

	public switchToUnitMode(): void {
		this.unitModeContainer.alpha = 1
		this.cardModeContainer.alpha = 0
		this.cardModeTextContainer.alpha = 0

		this.powerText.position.set(97, 80)
		this.powerText.style.fontSize = 135

		this.attackText.position.set(0, 0)
		this.attackText.style.fontSize = 71

		this.cardNameText.position.set(0, 0)
		this.cardNameText.style.fontSize = 150

		this.cardTitleText.position.set(-10, 67)
		this.cardTitleText.style.fontSize = 22

		this.cardDescriptionText.position.set(0, 100)
		this.cardDescriptionText.style.fontSize = 50
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
