import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Localization from '@/Pixi/Localization'
import Settings from '@/Pixi/Settings'
import RichText from '@/Pixi/render/RichText'
import Utils from '@/utils/Utils'
import CardAttributes from '@/Pixi/render/CardAttributes'
import CardMessage from '@shared/models/network/CardMessage'
import ScalingText from '@/Pixi/render/ScalingText'
import RichTextVariables from '@shared/models/RichTextVariables'
import DescriptionTextBackground from '@/Pixi/render/DescriptionTextBackground'

export default class RenderedCard extends Card {
	public variables: RichTextVariables

	public coreContainer: PIXI.Container
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	private readonly cardModeContainer: PIXI.Container
	private readonly cardModeTextContainer: PIXI.Container
	private readonly unitModeContainer: PIXI.Container
	private readonly unitModeAttributes: CardAttributes

	private readonly powerTextBackground: PIXI.Sprite
	private readonly manacostTextBackground: PIXI.Sprite
	private readonly descriptionTextBackground: DescriptionTextBackground

	readonly powerText: ScalingText
	private readonly cardNameText: ScalingText
	private readonly cardTitleText: ScalingText
	private readonly cardTribeTexts: ScalingText[]
	private readonly cardDescriptionText: RichText

	constructor(message: CardMessage) {
		super(message.id, message.type, message.class)
		this.id = message.id
		this.type = message.type
		this.class = message.class
		this.color = message.color

		this.name = message.name
		this.title = message.title
		this.tribes = message.tribes.slice()
		this.description = message.description
		this.variables = message.variables

		this.power = message.power
		this.attack = message.attack
		this.attackRange = message.attackRange
		this.healthArmor = message.healthArmor

		this.basePower = message.basePower
		this.baseAttack = message.baseAttack
		this.baseAttackRange = message.baseAttackRange
		this.baseHealthArmor = message.baseHealthArmor

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture(`cards/${this.class}`))
		this.powerText = this.createPowerText(this.power.toString())
		this.cardNameText = this.createCardNameText(Localization.getString(this.name))
		this.cardTitleText = this.createCardNameText(Localization.getString(this.title))
		this.cardTribeTexts = this.tribes.map(tribe => this.createCardNameText(Localization.getString(`card.tribe.${tribe}`)))
		this.cardDescriptionText = new RichText(Localization.getString(this.description), 350, this.getDescriptionTextVariables())
		this.hitboxSprite = this.createHitboxSprite(this.sprite)

		this.sprite.alpha = 0
		this.sprite.anchor.set(0.5)

		/* Internal container */
		const internalContainer = new PIXI.Container()
		internalContainer.position.x = -this.sprite.texture.width / 2
		internalContainer.position.y = -this.sprite.texture.height / 2
		this.sprite.addChild(internalContainer)

		/* Card attributes */
		this.unitModeAttributes = new CardAttributes(this, CardDisplayMode.ON_BOARD)
		this.unitModeAttributes.position.set(this.sprite.texture.width, this.sprite.texture.height)
		this.unitModeAttributes.pivot.set(this.sprite.texture.width, this.sprite.texture.height)

		/* Card mode container */
		this.cardModeContainer = new PIXI.Container()
		if (Localization.getString(this.name)) {
			this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-name')))
		}
		if (Localization.getString(this.description)) {
			this.descriptionTextBackground = new DescriptionTextBackground()
			this.descriptionTextBackground.position.set(0, this.sprite.texture.height)
			this.cardDescriptionText.setBackground(this.descriptionTextBackground)
			this.cardModeContainer.addChild(this.descriptionTextBackground)
		}
		for (let i = 0; i < this.tribes.length; i++) {
			const tribeBackgroundSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-tribe'))
			tribeBackgroundSprite.position.y += i * 40
			this.cardModeContainer.addChild(tribeBackgroundSprite)
		}
		this.powerTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power'))
		this.manacostTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-manacost'))
		this.cardModeContainer.addChild(this.powerTextBackground)
		this.cardModeContainer.addChild(this.manacostTextBackground)
		internalContainer.addChild(this.cardModeContainer)

		/* Unit mode container */
		this.unitModeContainer = new PIXI.Container()
		this.unitModeContainer.addChild(this.unitModeAttributes)
		this.unitModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom')))
		internalContainer.addChild(this.unitModeContainer)

		/* Core container */
		this.coreContainer = new PIXI.Container()
		this.coreContainer.visible = false
		this.coreContainer.addChild(this.sprite)
		this.coreContainer.addChild(this.powerText)
		this.coreContainer.position.set(0, 0)

		/* Card mode text container */
		this.cardModeTextContainer = new PIXI.Container()
		this.cardModeTextContainer.addChild(this.cardNameText)
		this.cardModeTextContainer.addChild(this.cardTitleText)
		this.cardTribeTexts.forEach(cardTribeText => { this.cardModeTextContainer.addChild(cardTribeText) })
		this.cardModeTextContainer.addChild(this.cardDescriptionText)
		this.coreContainer.addChild(this.cardModeTextContainer)
	}

	public getDescriptionTextVariables(): RichTextVariables {
		return {
			...this.variables,
			name: Localization.getString(this.name),
			attack: this.attack.toString(),
			attackRange: this.attackRange.toString(),
			healthArmor: this.healthArmor.toString()
		}
	}

	public setCardVariables(cardVariables: RichTextVariables): void {
		this.variables = cardVariables
		this.cardDescriptionText.textVariables = this.getDescriptionTextVariables()
	}

	public getPosition(): PIXI.Point {
		return new PIXI.Point(this.hitboxSprite.position.x, this.hitboxSprite.position.y)
	}

	public isHovered(): boolean {
		return this.hitboxSprite.containsPoint(Core.input.mousePosition)
	}

	public setPower(value: number): void {
		this.power = Math.max(0, value)
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

		if (displayMode === CardDisplayMode.IN_HAND ||
				displayMode === CardDisplayMode.IN_HAND_HOVERED ||
				displayMode === CardDisplayMode.INSPECTED ||
				displayMode === CardDisplayMode.ANNOUNCED ||
				displayMode === CardDisplayMode.RESOLVING) {
			this.switchToCardMode()
			texts = [this.powerText, this.cardNameText, this.cardTitleText, this.cardDescriptionText].concat(this.cardTribeTexts)
		} else if (displayMode === CardDisplayMode.ON_BOARD) {
			this.switchToUnitMode()
			texts = [this.powerText]
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
		this.powerText.visible = true
		this.powerTextBackground.visible = this.type === CardType.UNIT
		this.manacostTextBackground.visible = this.type === CardType.SPELL

		this.powerText.position.set(60, 45)
		if (this.power < 10) {
			this.powerText.style.fontSize = 85
		} else {
			this.powerText.style.fontSize = 71
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

		this.cardDescriptionText.position.set(0, -24)

		const description = Localization.getString(this.description)
		let fontSize = 26
		if (description.length > 150) { fontSize = 22 }
		if (description.length > 300) { fontSize = 20 }

		this.cardDescriptionText.style.baseFontSize = fontSize
		this.cardDescriptionText.setFont(fontSize, fontSize + 6)
	}

	public switchToUnitMode(): void {
		this.unitModeContainer.visible = true
		this.cardModeContainer.visible = false
		this.cardModeTextContainer.visible = false
		this.unitModeAttributes.visible = false

		this.powerText.position.set(97, 80)
		if (this.power < 10) {
			this.powerText.style.fontSize = 160
		} else {
			this.powerText.style.fontSize = 135
		}
	}

	public switchToHiddenMode(): void {
		this.cardModeContainer.visible = false
		this.unitModeContainer.visible = false
		this.cardModeTextContainer.visible = false
		this.powerTextBackground.visible = false
		this.powerText.visible = false
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
