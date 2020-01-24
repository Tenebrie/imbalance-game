import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@/Pixi/shared/models/Card'
import CardType from '@/Pixi/shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import {CardDisplayMode} from '@/Pixi/enums/CardDisplayMode'
import Localization from '@/Pixi/Localization'
import Settings from '@/Pixi/Settings'
import RichText from '@/Pixi/render/RichText'
import Utils from '@/utils/Utils'
import CardAttributes from '@/Pixi/render/CardAttributes'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import ScalingText from '@/Pixi/render/ScalingText'

export default class RenderedCard extends Card {
	public coreContainer: PIXI.Container
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	private readonly cardModeContainer: PIXI.Container
	private readonly cardModeTextContainer: PIXI.Container
	private readonly cardModeAttributes: CardAttributes
	private readonly unitModeContainer: PIXI.Container
	private readonly unitModeAttributes: CardAttributes

	private readonly powerTextBackground: PIXI.Sprite

	private readonly powerText: ScalingText
	private readonly attackText: ScalingText
	private readonly attackRangeText: ScalingText
	private readonly healthArmorText: ScalingText
	private readonly cardNameText: ScalingText
	private readonly cardTitleText: ScalingText
	private readonly cardTribeTexts: ScalingText[]
	private readonly cardDescriptionText: RichText

	constructor(message: CardMessage) {
		super(message.id, message.cardType, message.cardClass)
		this.unitSubtype = message.unitSubtype

		this.cardName = message.cardName
		this.cardTitle = message.cardTitle
		this.cardTribes = message.cardTribes.slice()
		this.cardDescription = message.cardDescription

		this.power = message.power
		this.attack = message.attack
		this.attackRange = message.attackRange
		this.healthArmor = message.healthArmor

		this.basePower = message.basePower
		this.baseAttack = message.baseAttack
		this.baseAttackRange = message.baseAttackRange
		this.baseHealthArmor = message.baseHealthArmor

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.cardClass}`))
		this.powerText = this.createPowerText(this.power.toString())
		this.attackText = this.createAttackText(this.attack.toString())
		this.attackRangeText = this.createAttributeText(this.attackRange.toString())
		this.healthArmorText = this.createAttributeText(this.healthArmor.toString())
		this.cardNameText = this.createCardNameText(Localization.getString(this.cardName))
		this.cardTitleText = this.createCardNameText(Localization.getString(this.cardTitle))
		this.cardTribeTexts = this.cardTribes.map(tribe => this.createCardNameText(Localization.getString(`card.tribe.${tribe}`)))
		this.cardDescriptionText = new RichText(this, Localization.getString(this.cardDescription), 350)
		this.hitboxSprite = this.createHitboxSprite(this.sprite)

		this.sprite.anchor.set(0.5)

		/* Internal container */
		const internalContainer = new PIXI.Container()
		internalContainer.position.x = -this.sprite.texture.width / 2
		internalContainer.position.y = -this.sprite.texture.height / 2
		this.sprite.addChild(internalContainer)

		/* Card attributes */
		this.cardModeAttributes = new CardAttributes(this, CardDisplayMode.IN_HAND)
		this.unitModeAttributes = new CardAttributes(this, CardDisplayMode.ON_BOARD)
		this.cardModeAttributes.position.set(this.sprite.texture.width, this.sprite.texture.height)
		this.cardModeAttributes.pivot.set(this.sprite.texture.width, this.sprite.texture.height)
		this.unitModeAttributes.position.set(this.sprite.texture.width, this.sprite.texture.height)
		this.unitModeAttributes.pivot.set(this.sprite.texture.width, this.sprite.texture.height)

		/* Card mode container */
		this.cardModeContainer = new PIXI.Container()
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-name')))
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description')))
		for (let i = 0; i < this.cardTribes.length; i++) {
			const tribeBackgroundSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-tribe'))
			tribeBackgroundSprite.position.y += i * 40
			this.cardModeContainer.addChild(tribeBackgroundSprite)
		}
		this.powerTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power'))
		this.cardModeContainer.addChild(this.powerTextBackground)
		this.cardModeContainer.addChild(this.cardModeAttributes)
		internalContainer.addChild(this.cardModeContainer)

		/* Unit mode container */
		this.unitModeContainer = new PIXI.Container()
		this.unitModeContainer.addChild(this.unitModeAttributes)
		this.unitModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom')))
		internalContainer.addChild(this.unitModeContainer)

		/* Core container */
		this.coreContainer = new PIXI.Container()
		this.coreContainer.addChild(this.sprite)
		this.coreContainer.addChild(this.powerText)
		this.coreContainer.position.set(-1000, -1000)
		this.coreContainer.addChild(this.attackText)

		/* Card mode text container */
		this.cardModeTextContainer = new PIXI.Container()
		this.cardModeTextContainer.addChild(this.cardNameText)
		this.cardModeTextContainer.addChild(this.cardTitleText)
		this.cardTribeTexts.forEach(cardTribeText => { this.cardModeTextContainer.addChild(cardTribeText) })
		this.cardModeTextContainer.addChild(this.cardDescriptionText)
		this.cardModeTextContainer.addChild(this.attackRangeText)
		this.cardModeTextContainer.addChild(this.healthArmorText)
		this.coreContainer.addChild(this.cardModeTextContainer)
	}

	public getPosition(): PIXI.Point {
		return new PIXI.Point(this.hitboxSprite.position.x, this.hitboxSprite.position.y)
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
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

	public createPowerText(text: string): ScalingText {
		const textObject = new ScalingText(text, new PIXI.TextStyle({
			fontFamily: 'BrushScript',
			fill: 0x000000,
			padding: 16
		}))
		textObject.anchor.set(0.5)
		return textObject
	}

	public createAttackText(text: string): ScalingText {
		const textObject = new ScalingText(text, new PIXI.TextStyle({
			fontFamily: 'BrushScript',
			fill: 0x000000,
			padding: 16
		}))
		textObject.anchor.set(0, 0.5)
		return textObject
	}

	public createAttributeText(text: string): ScalingText {
		const textObject = new ScalingText(text, new PIXI.TextStyle({
			fontFamily: 'BrushScript',
			fill: 0xFFFFFF,
			padding: 16
		}))
		textObject.anchor.set(0.5, 0.5)
		return textObject
	}

	public createCardNameText(text: string): ScalingText {
		const textObject = new ScalingText(text, new PIXI.TextStyle({
			fontFamily: Utils.getFont(text),
			fill: 0x000000,
			padding: 16,
			align: 'right'
		}))
		textObject.anchor.set(1, 0.5)
		return textObject
	}

	public setDisplayMode(displayMode: CardDisplayMode): void {
		if (this.displayMode === displayMode) {
			return
		}

		this.displayMode = displayMode

		let texts: (ScalingText | RichText)[] = []

		if (displayMode === CardDisplayMode.IN_HAND || displayMode === CardDisplayMode.IN_HAND_HOVERED || displayMode === CardDisplayMode.INSPECTED) {
			this.switchToCardMode()
			texts = [this.powerText, this.attackText, this.attackRangeText, this.healthArmorText, this.cardNameText, this.cardTitleText, this.cardDescriptionText].concat(this.cardTribeTexts)
		} else if (displayMode === CardDisplayMode.ON_BOARD) {
			this.switchToUnitMode()
			texts = [this.powerText, this.attackText]
		} else if (displayMode === CardDisplayMode.IN_HAND_HIDDEN) {
			this.switchToHiddenMode()
		}

		texts = texts.filter(text => text.text.length > 0)

		texts.forEach(text => {
			text.position.x *= this.sprite.scale.x
			text.position.y *= this.sprite.scale.y
			text.position.x = Math.round(text.position.x)
			text.position.y = Math.round(text.position.y)

			let renderScale = Settings.generalFontRenderScale
			if (this === Core.input.inspectedCard) {
				renderScale = 1.2
			} else if (text === this.cardDescriptionText) {
				renderScale = Settings.descriptionFontRenderScale
			}

			text.scale.set(1 / renderScale)
			text.scaleFont(this.sprite.scale.x * renderScale)
		})

		this.powerText.position.x -= this.sprite.width / 2
		this.powerText.position.y -= this.sprite.height / 2
		this.attackText.position.x += this.sprite.width / 2
		this.attackText.position.y += this.sprite.height / 2
		this.attackRangeText.position.x += this.sprite.width / 2
		this.attackRangeText.position.y += this.sprite.height / 2
		this.healthArmorText.position.x += this.sprite.width / 2
		this.healthArmorText.position.y += this.sprite.height / 2
		this.cardNameText.position.x += this.sprite.width / 2
		this.cardNameText.position.y -= this.sprite.height / 2
		this.cardTitleText.position.x += this.sprite.width / 2
		this.cardTitleText.position.y -= this.sprite.height / 2
		this.cardTribeTexts.forEach(cardTribeText => {
			cardTribeText.position.x += this.sprite.width / 2
			cardTribeText.position.y -= this.sprite.height / 2
		})
		this.cardDescriptionText.position.y += this.sprite.height / 2
	}

	public switchToCardMode(): void {
		this.unitModeContainer.visible = false
		this.cardModeContainer.visible = true
		this.cardModeTextContainer.visible = true
		if (this.cardType === CardType.SPELL) {
			this.powerText.visible = false
			this.attackText.visible = false
			this.attackRangeText.visible = false
			this.healthArmorText.visible = false
			this.cardModeAttributes.visible = false
			this.powerTextBackground.visible = false
		}

		this.powerText.position.set(60, 45)
		this.powerText.style.fontSize = 71

		this.attackText.position.copyFrom(this.cardModeAttributes.getAttackTextPosition())
		this.attackText.style.fontSize = this.cardModeAttributes.getAttackTextFontSize()

		this.attackRangeText.visible = false
		if (this.attackRange !== 1) {
			this.attackRangeText.visible = true
			this.attackRangeText.position.copyFrom(this.cardModeAttributes.getAttackRangeTextPosition())
			this.attackRangeText.style.fontSize = this.cardModeAttributes.getAttackRangeTextFontSize()
		}

		this.healthArmorText.visible = false
		if (this.healthArmor > 0) {
			this.healthArmorText.visible = true
			this.healthArmorText.position.copyFrom(this.cardModeAttributes.getHealthArmorTextPosition())
			this.healthArmorText.style.fontSize = this.cardModeAttributes.getHealthArmorTextFontSize()
		}

		this.cardNameText.position.set(-15, 67)
		this.cardNameText.style.fontSize = 22

		if (this.cardTitleText.text.length > 0) {
			this.cardNameText.position.y -= 11
			this.cardTitleText.position.set(-15, 81)
			this.cardTitleText.style.fontSize = 18
		}

		for (let i = 0; i < this.cardTribeTexts.length; i++) {
			const cardTribeText = this.cardTribeTexts[i]
			cardTribeText.position.set(-15, 122)
			cardTribeText.position.y += i * 40
			cardTribeText.style.fontSize = 20
		}

		this.cardDescriptionText.position.set(0, -135)

		const description = Localization.getString(this.cardDescription)
		let fontSize = 26
		if (description.length > 50) { fontSize = 24 }
		if (description.length > 100) { fontSize = 22 }
		if (description.length > 150) { fontSize = 20 }
		if (description.length > 200) { fontSize = 18 }
		if (description.length > 250) { fontSize = 16 }
		this.cardDescriptionText.style.baseFontSize = fontSize
		this.cardDescriptionText.setFont(fontSize, fontSize + 6)
	}

	public switchToUnitMode(): void {
		this.unitModeContainer.visible = true
		this.cardModeContainer.visible = false
		this.cardModeTextContainer.visible = false

		this.powerText.position.set(97, 80)
		this.powerText.style.fontSize = 135

		this.attackText.position.copyFrom(this.unitModeAttributes.getAttackTextPosition())
		this.attackText.style.fontSize = this.unitModeAttributes.getAttackTextFontSize()

		this.attackRangeText.visible = false
		this.healthArmorText.visible = false
	}

	public switchToHiddenMode(): void {
		this.cardModeContainer.visible = false
		this.unitModeContainer.visible = false
		this.cardModeTextContainer.visible = false
		this.powerText.visible = false
		this.attackText.visible = false
		this.attackRangeText.visible = false
		this.healthArmorText.visible = false
	}

	public unregister(): void {
		Core.unregisterCard(this)
	}

	public static fromMessage(message: CardMessage): RenderedCard {
		const card = new RenderedCard(message)
		Core.registerCard(card)
		return card
	}
}
