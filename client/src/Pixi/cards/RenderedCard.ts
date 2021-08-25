import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Localization from '@/Pixi/Localization'
import RichText from '@/Pixi/render/RichText'
import Utils, { snakeToCamelCase } from '@/utils/Utils'
import ScalingText from '@/Pixi/render/ScalingText'
import RichTextVariables from '@shared/models/RichTextVariables'
import DescriptionTextBackground from '@/Pixi/render/DescriptionTextBackground'
import CardColor from '@shared/enums/CardColor'
import ClientBuffContainer from '@/Pixi/models/buffs/ClientBuffContainer'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import store from '@/Vue/store'
import RichTextAlign from '@/Pixi/render/RichTextAlign'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'
import CardFaction from '@shared/enums/CardFaction'
import ClientCardStats from '@/Pixi/models/ClientCardStats'
import CardMessage from '@shared/models/network/card/CardMessage'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardLocation from '@shared/enums/CardLocation'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import { forEachInEnum } from '@shared/Utils'
import LeaderStatType from '@shared/enums/LeaderStatType'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'
import { CardLocalization } from '@shared/models/cardLocalization/CardLocalization'

type WorkshopCardProps = {
	workshopTitle: string
	workshopImage: PIXI.Texture
	workshopTribes: string[]
}

export default class RenderedCard implements Card {
	public readonly id: string
	public readonly type: CardType
	public readonly class: string
	public readonly color: CardColor
	public readonly faction: CardFaction

	public readonly stats: ClientCardStats
	public readonly buffs: ClientBuffContainer
	public readonly localization: CardLocalization
	public readonly baseTribes: CardTribe[]
	public readonly baseFeatures: CardFeature[]
	public readonly relatedCards: string[]
	public variables: RichTextVariables
	public readonly sortPriority: number
	public readonly expansionSet: ExpansionSet

	public readonly isCollectible: boolean
	public readonly isExperimental: boolean

	public isHidden: boolean

	public coreContainer: PIXI.Container
	public sprite: PIXI.Sprite
	public hitboxSprite: PIXI.Sprite
	public displayMode = CardDisplayMode.UNDEFINED

	public readonly deployEffectContainer: PIXI.Container

	private readonly cardModeContainer: PIXI.Container
	private readonly cardModeTextContainer: PIXI.Container
	private readonly unitModeContainer: PIXI.Container

	public readonly powerTextBackground: PIXI.Sprite
	public readonly armorTextBackground: PIXI.Sprite
	private readonly armorTextZoomBackground: PIXI.Sprite
	private readonly manacostTextBackground: PIXI.Sprite
	private readonly descriptionTextBackground: DescriptionTextBackground

	public readonly cardTintOverlay: PIXI.Sprite
	public readonly cardFullTintOverlay: PIXI.Sprite

	public readonly powerText: ScalingText
	public readonly armorText: ScalingText
	private readonly cardNameText: RichText
	private readonly cardTitleText: RichText
	private readonly cardTribeTexts: ScalingText[]
	private readonly cardDescriptionText: RichText

	public constructor(message: CardMessage & Partial<WorkshopCardProps>) {
		this.id = message.id
		this.type = message.type
		this.class = message.class
		this.color = message.color
		this.faction = message.faction

		this.stats = new ClientCardStats(this, message.stats)
		this.buffs = new ClientBuffContainer(this, message.buffs)
		this.localization = message.localization
		this.baseTribes = (message.baseTribes || []).slice()
		this.baseFeatures = (message.baseFeatures || []).slice()
		this.relatedCards = (message.relatedCards || []).slice()
		this.expansionSet = message.expansionSet
		this.variables = message.variables
		this.sortPriority = message.sortPriority

		this.isCollectible = message.isCollectible
		this.isExperimental = message.isExperimental

		this.isHidden = message.isHidden

		const spriteTexture = message.workshopImage ? message.workshopImage : TextureAtlas.getTexture(`cards/${this.class}`)
		this.sprite = new PIXI.Sprite(spriteTexture)
		const powerTextValue = this.type === CardType.UNIT ? this.stats.power : this.stats.spellCost
		this.powerText = this.createBrushScriptText(powerTextValue.toString())
		this.armorText = this.createBrushScriptText(this.stats.armor.toString())
		this.cardNameText = new RichText(this.name, 200, this.getDescriptionTextVariables())
		this.cardNameText.style.fill = 0x000000
		this.cardNameText.verticalAlign = RichTextAlign.CENTER
		this.cardNameText.horizontalAlign = RichTextAlign.END
		const titleText = message.workshopTitle || Localization.getCardTitle(this) || ''
		this.cardTitleText = new RichText(titleText, 200, this.getDescriptionTextVariables())
		this.cardTitleText.style.fill = 0x000000
		this.cardTitleText.verticalAlign = RichTextAlign.CENTER
		this.cardTitleText.horizontalAlign = RichTextAlign.END
		this.cardTribeTexts = this.tribes
			.map((tribe) => this.createTitleText(Localization.get(`card.tribe.${tribe}`)))
			.concat((message.workshopTribes || []).map((tribe) => this.createTitleText(tribe)))
		this.cardDescriptionText = new RichText(this.displayedDescription, 370, this.getDescriptionTextVariables())
		this.hitboxSprite = this.createHitboxSprite(this.sprite)

		this.sprite.alpha = 0
		this.sprite.anchor.set(0.5)

		/* Internal container */
		const internalContainer = new PIXI.Container()
		internalContainer.position.x = -this.sprite.texture.width / 2
		internalContainer.position.y = -this.sprite.texture.height / 2
		this.sprite.addChild(internalContainer)

		/* Card quality overlay */
		let overlaySprite
		if (this.type === CardType.UNIT && this.color === CardColor.BRONZE) {
			overlaySprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-overlay-unit-bronze'))
		} else if (this.type === CardType.UNIT && this.color === CardColor.SILVER) {
			overlaySprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-overlay-unit-silver'))
		} else if (this.type === CardType.UNIT && this.color === CardColor.GOLDEN) {
			overlaySprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-overlay-unit-golden'))
		} else if (this.type === CardType.UNIT && this.color === CardColor.LEADER) {
			overlaySprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-overlay-unit-leader'))
		} else if (this.type === CardType.SPELL) {
			overlaySprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-overlay-spell'))
		}
		if (overlaySprite) {
			overlaySprite.anchor.set(0.5, 0.5)
			this.sprite.addChild(overlaySprite)
		}

		/* Card mode container */
		this.cardModeContainer = new PIXI.Container()
		this.cardModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-name')))
		this.descriptionTextBackground = new DescriptionTextBackground()
		if (Localization.getCardDescription(this)) {
			this.descriptionTextBackground.position.set(0, this.sprite.texture.height + 1)
			this.cardDescriptionText.setBackground(this.descriptionTextBackground)
			this.cardModeContainer.addChild(this.descriptionTextBackground)
		}
		const tribeCount = this.tribes.length + (message.workshopTribes || []).length
		for (let i = 0; i < tribeCount; i++) {
			const tribeBackgroundSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-tribe'))
			tribeBackgroundSprite.position.y += i * 40
			this.cardModeContainer.addChild(tribeBackgroundSprite)
		}
		this.powerTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power'))
		this.armorTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-armor'))
		this.manacostTextBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-manacost'))
		this.cardModeContainer.addChild(this.powerTextBackground)
		this.cardModeContainer.addChild(this.armorTextBackground)
		this.cardModeContainer.addChild(this.manacostTextBackground)
		internalContainer.addChild(this.cardModeContainer)

		/* Unit mode container */
		this.unitModeContainer = new PIXI.Container()
		this.unitModeContainer.addChild(new PIXI.Sprite(TextureAtlas.getTexture('components/bg-power-zoom')))
		this.armorTextZoomBackground = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-armor-zoom'))
		this.unitModeContainer.addChild(this.armorTextZoomBackground)
		internalContainer.addChild(this.unitModeContainer)

		this.deployEffectContainer = new PIXI.Container()

		/* Core container */
		this.coreContainer = new PIXI.Container()
		this.coreContainer.visible = false
		this.coreContainer.addChild(this.deployEffectContainer)
		this.coreContainer.addChild(this.sprite)
		this.coreContainer.addChild(this.powerText)
		this.coreContainer.addChild(this.armorText)
		this.coreContainer.position.set(0, 0)

		/* Card mode text container */
		this.cardModeTextContainer = new PIXI.Container()
		this.cardModeTextContainer.addChild(this.cardNameText)
		this.cardModeTextContainer.addChild(this.cardTitleText)
		this.cardTribeTexts.forEach((cardTribeText) => {
			this.cardModeTextContainer.addChild(cardTribeText)
		})
		this.cardModeTextContainer.addChild(this.cardDescriptionText)
		this.coreContainer.addChild(this.cardModeTextContainer)

		/* Card tint overlays */
		this.cardTintOverlay = new PIXI.Sprite(TextureAtlas.getTexture('components/tint-overlay'))
		this.cardTintOverlay.alpha = 0
		this.cardTintOverlay.anchor.set(0.5, 0.5)
		this.coreContainer.addChild(this.cardTintOverlay)

		this.cardFullTintOverlay = new PIXI.Sprite(TextureAtlas.getTexture('components/tint-overlay-full'))
		this.cardFullTintOverlay.alpha = 0
		this.cardFullTintOverlay.tint = 0x000000
		this.cardFullTintOverlay.anchor.set(0.5, 0.5)
		this.coreContainer.addChild(this.cardFullTintOverlay)
	}

	public get name(): string {
		return Localization.getCardName(this)
	}

	public get title(): string | null {
		return Localization.getCardTitle(this)
	}

	public get flavor(): string | null {
		return Localization.getCardFlavor(this)
	}

	public get listName(): string | null {
		return Localization.getCardListName(this)
	}

	public get description(): string {
		return Localization.getCardDescription(this)
	}

	public getDescriptionTextVariables(): RichTextVariables {
		return {
			...this.variables,
			name: this.name,
		}
	}

	public getPosition(): PIXI.Point {
		if (!this.hitboxSprite || !this.hitboxSprite.position) {
			console.warn('No hitbox sprite available')
			return new PIXI.Point(0, 0)
		}
		return new PIXI.Point(this.hitboxSprite.position.x, this.hitboxSprite.position.y)
	}

	public getVisualPosition(): PIXI.Point {
		try {
			return new PIXI.Point(this.coreContainer.position.x + this.sprite.position.x, this.coreContainer.position.y + this.sprite.position.y)
		} catch (err) {
			console.error(err)
			return new PIXI.Point(0, 0)
		}
	}

	public get tribes(): CardTribe[] {
		let tribes = this.baseTribes.slice()
		this.buffs.buffs.forEach((buff) => {
			tribes = tribes.concat(buff.cardTribes.slice())
		})
		return [...new Set(tribes)]
	}

	public get features(): CardFeature[] {
		let features = this.baseFeatures.slice()
		this.buffs.buffs.forEach((buff) => {
			features = features.concat(buff.cardFeatures.slice())
		})
		return [...new Set(features)]
	}

	public get displayedDescription(): string {
		const featureStrings = this.features
			.map((feature) => `card.feature.${snakeToCamelCase(CardFeature[feature])}.text`)
			.map((feature) => Localization.get(feature, 'null'))
			.filter((string) => string !== null)

		const leaderStatsStrings: string[] = []
		forEachInEnum(LeaderStatType, (value, key) => {
			if (this.stats.leaderStats[value] === 0) {
				return
			}
			const text = Localization.get(`card.stats.${snakeToCamelCase(key.toLowerCase())}.text`, 'null')
			if (text === null) {
				return
			}

			leaderStatsStrings.push(text.replace(/{value}/g, String(this.stats.leaderStats[value])))
		})

		let description = this.description
		for (const index in leaderStatsStrings.reverse()) {
			const delimiter = Number(index) === 0 ? (description.trim().length > 0 ? '<p>' : '') : '\n'
			description = `${leaderStatsStrings[index]}${delimiter}${description}`
		}

		if (featureStrings.length > 0) {
			const delimiter = description.trim().length > 0 ? '<p>' : ''
			description = `${featureStrings.join(' | ')}${delimiter}${description}`
		}
		return description
	}

	public updateCardDescription(): void {
		this.cardDescriptionText.text = this.displayedDescription
	}

	public setCardVariables(cardVariables: RichTextVariables): void {
		this.variables = cardVariables
		this.cardDescriptionText.textVariables = this.getDescriptionTextVariables()
	}

	public isHovered(): boolean {
		return this.hitboxSprite.containsPoint(Core.input.mousePosition)
	}

	public createHitboxSprite(sprite: PIXI.Sprite): PIXI.Sprite {
		const hitboxSprite = new PIXI.Sprite(sprite.texture)
		hitboxSprite.alpha = 0
		hitboxSprite.anchor.set(0.5)
		hitboxSprite.tint = 0xaa5555
		hitboxSprite.zIndex = -1
		return hitboxSprite
	}

	public createBrushScriptText(text: string): ScalingText {
		const textObject = new ScalingText(
			text,
			new PIXI.TextStyle({
				fontFamily: 'BrushScript',
				fill: 0x000000,
				padding: 16,
			})
		)
		textObject.anchor.set(0.5)
		return textObject
	}

	public createTitleText(text: string): ScalingText {
		const textObject = new ScalingText(
			text,
			new PIXI.TextStyle({
				fontFamily: Utils.getFont(text),
				fill: 0x000000,
				padding: 32,
				align: 'right',
			})
		)
		textObject.anchor.set(1, 0.5)
		return textObject
	}

	public setDisplayMode(displayMode: CardDisplayMode): void {
		if (this.displayMode === displayMode) {
			return
		}

		this.displayMode = displayMode
		this.resetDisplayMode()
	}

	public resetDisplayMode(): void {
		let texts: (ScalingText | RichText)[] = []
		const scaleSettings = getRenderScale()

		if (this.isCardMode()) {
			this.switchToCardMode()
			texts = [this.powerText, this.armorText, this.cardNameText, this.cardTitleText, this.cardDescriptionText].concat(this.cardTribeTexts)
		} else if (this.isUnitMode()) {
			this.switchToUnitMode()
			texts = [this.powerText, this.armorText]
		} else if (this.isHidden) {
			this.switchToHiddenMode()
		}
		this.cardTintOverlay.width = this.sprite.width
		this.cardTintOverlay.height = this.sprite.height
		this.cardFullTintOverlay.width = this.sprite.width
		this.cardFullTintOverlay.height = this.sprite.height

		texts = texts.filter((text) => text.text.length > 0)

		texts.forEach((text) => {
			text.position.x *= this.sprite.scale.x
			text.position.y *= this.sprite.scale.y
			text.position.x = Math.round(text.position.x)
			text.position.y = Math.round(text.position.y)

			const isInGame = store.getters.gameStateModule.isInGame
			let renderScale = isInGame ? scaleSettings.generalGameFontRenderScale : scaleSettings.generalEditorFontRenderScale
			if (Core.input && this === Core.input.inspectedCard) {
				renderScale *= 1.2
			} else if (text === this.cardDescriptionText) {
				renderScale = isInGame ? scaleSettings.descriptionGameFontRenderScale : scaleSettings.descriptionEditorFontRenderScale
			}

			text.scale.set(1 / renderScale)
			text.scaleFont(this.sprite.scale.x * renderScale)
		})

		this.powerText.position.x -= this.sprite.width / 2
		this.powerText.position.y -= this.sprite.height / 2
		this.armorText.position.x -= this.sprite.width / 2
		this.armorText.position.y -= this.sprite.height / 2
		this.cardNameText.position.x += this.sprite.width / 2
		this.cardNameText.position.y -= this.sprite.height / 2
		this.cardTitleText.position.x += this.sprite.width / 2
		this.cardTitleText.position.y -= this.sprite.height / 2
		this.cardTribeTexts.forEach((cardTribeText) => {
			cardTribeText.position.x += this.sprite.width / 2
			cardTribeText.position.y -= this.sprite.height / 2
		})
		this.cardDescriptionText.position.y += this.sprite.height / 2

		if (this.type === CardType.UNIT) {
			this.updatePowerTextColors()
			this.updateArmorTextColors()
		} else {
			this.updateSpellCostTextColors()
		}
	}

	public switchToCardMode(): void {
		this.unitModeContainer.visible = false
		this.cardModeContainer.visible = true
		this.cardModeTextContainer.visible = true
		this.powerText.visible = this.type === CardType.UNIT || this.type === CardType.SPELL
		this.powerTextBackground.visible = this.type === CardType.UNIT
		this.armorTextBackground.visible = true
		this.manacostTextBackground.visible = this.type === CardType.SPELL

		const powerTextValue = this.type === CardType.UNIT ? this.stats.power : this.stats.spellCost
		this.powerText.position.set(60, 45)
		if (powerTextValue < 10) {
			this.powerText.style.fontSize = 85
		} else if (powerTextValue < 100) {
			this.powerText.style.fontSize = 71
		} else if (powerTextValue < 1000) {
			this.powerText.style.fontSize = 54
		} else {
			this.powerText.style.fontSize = 40
		}

		if (this.type === CardType.SPELL) {
			this.powerText.style.fill = 0x0000aa
		} else {
			this.powerText.style.fill = 0x000000
		}

		this.armorText.position.set(132, 33)
		this.armorText.style.fontSize = 24
		this.armorText.style.fill = 0xffffff
		if (this.stats.armor > 0) {
			this.armorText.visible = true
			this.armorTextBackground.visible = true
		} else {
			this.armorText.visible = false
			this.armorTextBackground.visible = false
		}

		const name = this.cardNameText.renderedText
		let nameFontSize = 26
		let positionOffset = 0
		if (name.length > 15) {
			nameFontSize = 24
			positionOffset = 0
		}
		if (name.length > 25) {
			nameFontSize = 22
			positionOffset = 2
		}
		this.cardNameText.position.set(-15, 51 + positionOffset)
		this.cardNameText.style.fontSize = nameFontSize
		this.cardNameText.style.lineHeight = 20
		if (name.includes('\n')) {
			this.cardNameText.position.y += 3
		}

		if (this.cardTitleText.renderedText.length > 0) {
			this.cardNameText.position.y -= 13
			this.cardTitleText.position.set(-15, 69)
			this.cardTitleText.style.fontSize = 20
		}

		for (let i = 0; i < this.cardTribeTexts.length; i++) {
			const cardTribeText = this.cardTribeTexts[i]
			cardTribeText.position.set(-15, 122)
			cardTribeText.position.y += i * 40
			cardTribeText.style.fontSize = 20
		}

		this.cardDescriptionText.position.set(0, -54)

		const description = Localization.getCardDescription(this)
		let fontSize = 26
		if (description.length > 150) {
			fontSize = 24
		}
		if (description.length > 300) {
			fontSize = 22
		}

		this.cardDescriptionText.style.baseFontSize = fontSize
		this.cardDescriptionText.setFont(fontSize, 25)
	}

	public switchToUnitMode(): void {
		this.unitModeContainer.visible = true
		this.cardModeContainer.visible = false
		this.cardModeTextContainer.visible = false

		this.powerText.position.set(97, 80)
		if (this.stats.power < 10) {
			this.powerText.style.fontSize = 160
		} else {
			this.powerText.style.fontSize = 135
		}

		this.armorText.position.set(247, 63)
		this.armorText.style.fontSize = 52
		this.armorText.style.fill = 0xffffff
		if (this.stats.armor > 0) {
			this.armorText.visible = true
			this.armorTextZoomBackground.visible = true
		} else {
			this.armorText.visible = false
			this.armorTextZoomBackground.visible = false
		}
	}

	public switchToHiddenMode(): void {
		this.cardModeContainer.visible = false
		this.unitModeContainer.visible = false
		this.cardModeTextContainer.visible = false
		this.powerTextBackground.visible = false
		this.powerText.visible = false
		this.armorText.visible = false
	}

	public updatePowerTextColors(): void {
		if (this.type !== CardType.UNIT) {
			return
		}

		this.powerText.text = this.stats.power.toString()
		if (this.stats.power < this.stats.basePower) {
			this.powerText.style.fill = 0x770000
		} else if (this.stats.power > this.stats.basePower) {
			this.powerText.style.fill = 0x007700
		} else {
			this.powerText.style.fill = 0x000000
		}
	}

	public updateArmorTextColors(): void {
		this.armorText.text = this.stats.card.stats.armor.toString()
		this.armorText.visible = this.stats.armor > 0
		this.armorTextBackground.visible = this.stats.armor > 0
		this.armorTextZoomBackground.visible = this.stats.armor > 0

		if (this.stats.armor === 0) {
			this.armorText.style.fill = 0xff7777
		} else if (this.stats.armor < this.stats.baseArmor) {
			this.armorText.style.fill = 0xff7777
		} else if (this.stats.armor > this.stats.baseArmor) {
			this.armorText.style.fill = 0x77ff77
		} else {
			this.armorText.style.fill = 0xffffff
		}
	}

	public updateSpellCostTextColors(): void {
		if (this.type !== CardType.SPELL) {
			return
		}

		this.powerText.text = this.stats.spellCost.toString()
		if (this.stats.spellCost < this.stats.baseSpellCost) {
			this.powerText.style.fill = 0x0077aa
		} else if (this.stats.spellCost > this.stats.baseSpellCost) {
			this.powerText.style.fill = 0x7700aa
		} else {
			this.powerText.style.fill = 0x0000aa
		}
	}

	public isCardMode(): boolean {
		return !this.isUnitMode() && !this.isHidden
	}

	public isUnitMode(): boolean {
		return !this.isHidden && [CardDisplayMode.ON_BOARD].includes(this.displayMode)
	}

	public get owner(): ClientPlayerInGame | ClientPlayerGroup | null {
		const thisCardInGame = Core.game.findOwnedCardById(this.id)
		return thisCardInGame ? thisCardInGame.owner : null
	}

	public get ownerPlayer(): ClientPlayerInGame {
		const thisCardInGame = Core.game.findOwnedPlayerCardById(this.id)
		if (!thisCardInGame) {
			throw new Error('This card has no player owner!')
		}
		return thisCardInGame.owner
	}

	public get location(): CardLocation {
		const owner = this.owner
		if (!owner) {
			return CardLocation.UNKNOWN
		}

		if (owner instanceof ClientPlayerInGame) {
			if (owner.leader === this) {
				return CardLocation.LEADER
			}
			const cardInDeck = owner.cardDeck.findCardById(this.id)
			if (cardInDeck) {
				return CardLocation.DECK
			}
			const cardInHand = owner.cardHand.findCardById(this.id)
			if (cardInHand) {
				return CardLocation.HAND
			}
			const cardInStack = Core.resolveStack.findCardById(this.id)
			if (cardInStack) {
				return CardLocation.STACK
			}
		}
		const cardOnBoard = Core.board.findUnitById(this.id)
		if (cardOnBoard) {
			return CardLocation.BOARD
		}
		if (owner instanceof ClientPlayerInGame) {
			const cardInGraveyard = owner.cardGraveyard.findCardById(this.id)
			if (cardInGraveyard) {
				return CardLocation.GRAVEYARD
			}
		}
		return CardLocation.UNKNOWN
	}

	public static fromMessage(message: CardMessage): RenderedCard {
		const card = new RenderedCard(message)
		Core.registerCard(card)
		return card
	}
}
