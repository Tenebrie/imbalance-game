import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@shared/Constants'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import {GrabbedCardMode} from '@/Pixi/enums/GrabbedCardMode'
import RenderedGameBoard from '@/Pixi/cards/RenderedGameBoard'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import CardType from '@shared/enums/CardType'
import {CardDisplayMode} from '@/Pixi/enums/CardDisplayMode'
import CardTint from '@/Pixi/enums/CardTint'
import BoardRowTint from '@/Pixi/enums/BoardRowTint'
import Localization from '@/Pixi/Localization'
import MouseHover from '@/Pixi/input/MouseHover'
import RichText from '@/Pixi/render/RichText'
import Utils, {isMobile} from '@/utils/Utils'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import {inspectedCardRenderer} from './InspectedCardRenderer'
import {getRenderScale} from '@/Pixi/renderer/RendererUtils'
import {throttle} from 'throttle-debounce'
import RichTextAlign from '@/Pixi/render/RichTextAlign'
import {announcedCardRenderer} from '@/Pixi/renderer/AnnouncedCardRenderer'
import {playQueueRenderer} from '@/Pixi/renderer/PlayQueueRenderer'
import {isCardPlayable, isGrabbedCardPlayableToRow} from '@/Pixi/input/ValidActions'
import store from '@/Vue/store'

const UNIT_ZINDEX = 2
const UNIT_EFFECT_ZINDEX = 5
const HAND_CARD_ZINDEX = 11
const HAND_EFFECT_ZINDEX = 100
const HOVERED_CARD_ZINDEX = 105
const GRABBED_CARD_ZINDEX = 400
const SELECTABLE_CARD_ZINDEX = 500
const TARGETING_ARROW_ZINDEX = 550

export default class Renderer {
	pixi: PIXI.Application
	rootContainer: PIXI.Container
	boardEffectsContainer: PIXI.Container
	handEffectsContainer: PIXI.Container
	superSamplingLevel: number

	container: HTMLElement

	timeLabel: PIXI.Text
	actionLabel: RichText
	playerNameLabel: PIXI.Text
	opponentNameLabel: PIXI.Text
	playerPowerLabel: PIXI.Text
	playerPowerLabelContainer: PIXI.Container
	opponentPowerLabel: PIXI.Text
	opponentPowerLabelContainer: PIXI.Container

	selectableCardsSmokescreen: PIXI.Sprite

	deltaTime: number
	deltaTimeFraction: number

	CARD_ASPECT_RATIO = 408 / 584
	GAME_BOARD_WINDOW_FRACTION = 0.7
	PLAYER_HAND_WINDOW_FRACTION = 0.20
	OPPONENT_HAND_WINDOW_FRACTION = 0.20
	HOVERED_HAND_WINDOW_FRACTION = 0.30
	GAME_BOARD_OFFSET_FRACTION = -0.075
	OPPONENT_HAND_OFFSET_FRACTION = -0.15
	ANNOUNCED_CARD_WINDOW_FRACTION = 0.40
	SELECTABLE_CARD_DECK_WINDOW_FRACTION = 0.20
	SELECTABLE_CARD_DISCOVER_WINDOW_FRACTION = 0.30
	GAME_BOARD_ROW_WINDOW_FRACTION = this.GAME_BOARD_WINDOW_FRACTION / Constants.GAME_BOARD_ROW_COUNT

	constructor(container: HTMLElement) {
		this.superSamplingLevel = getRenderScale().superSamplingLevel
		let width = window.innerWidth * window.devicePixelRatio * this.superSamplingLevel
		let height = window.innerHeight * window.devicePixelRatio * this.superSamplingLevel
		if (isMobile()) {
			width = window.innerWidth
			height = window.innerHeight
		}

		this.pixi = new PIXI.Application({
			width,
			height,
			antialias: false,
			autoDensity: true,
			transparent: true,
			resolution: 1
		})

		this.rootContainer = new PIXI.Container()
		this.rootContainer.sortableChildren = true
		this.pixi.stage.addChild(this.rootContainer)

		this.boardEffectsContainer = new PIXI.Container()
		this.boardEffectsContainer.zIndex = UNIT_EFFECT_ZINDEX
		this.rootContainer.addChild(this.boardEffectsContainer)
		this.handEffectsContainer = new PIXI.Container()
		this.handEffectsContainer.zIndex = HAND_EFFECT_ZINDEX
		this.rootContainer.addChild(this.handEffectsContainer)

		this.pixi.view.style.maxWidth = '100vw'
		this.pixi.view.style.maxHeight = '100vh'
		container.appendChild(this.pixi.view)
		this.pixi.view.style['min-width'] = '1366px'
		this.container = container

		/* Time label */
		this.timeLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * this.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.timeLabel.anchor.set(0, 0.5)
		this.timeLabel.position.set(10, this.getScreenHeight() / 2)
		this.rootContainer.addChild(this.timeLabel)

		/* Action label */
		this.actionLabel = new RichText('Test text', 2000, {})
		this.actionLabel.zIndex = 85
		this.actionLabel.verticalAlign = RichTextAlign.END
		this.actionLabel.setFont(24 * this.superSamplingLevel, 12 * this.superSamplingLevel)
		this.actionLabel.style.dropShadow = true
		this.actionLabel.style.dropShadowBlur = 4
		this.rootContainer.addChild(this.actionLabel)

		/* Player name label */
		this.playerNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * this.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.playerNameLabel.anchor.set(0, 1)
		this.playerNameLabel.position.set(10, this.getScreenHeight() - 10)
		this.rootContainer.addChild(this.playerNameLabel)

		/* Opponent player name */
		this.opponentNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * this.superSamplingLevel,
			fill: 0xFFFFFF
		})

		this.opponentNameLabel.position.set(10, 10)
		this.rootContainer.addChild(this.opponentNameLabel)

		/* Power labels */
		this.playerPowerLabel = new PIXI.Text('', {
			fontFamily: 'Roboto',
		})
		this.playerPowerLabel.anchor.set(0.5, 0.5)
		const playerPowerLabelBackground = new PIXI.Sprite(TextureAtlas.getTexture('board/power-allied'))
		playerPowerLabelBackground.anchor.set(0, 0.5)
		playerPowerLabelBackground.width = this.GAME_BOARD_ROW_WINDOW_FRACTION * this.getScreenHeight() / 2
		playerPowerLabelBackground.height = this.GAME_BOARD_ROW_WINDOW_FRACTION * this.getScreenHeight() / 2
		this.playerPowerLabel.position.set(playerPowerLabelBackground.width / 2, 0)
		this.playerPowerLabelContainer = new PIXI.Container()
		this.playerPowerLabelContainer.addChild(this.playerPowerLabel)
		this.playerPowerLabelContainer.addChild(playerPowerLabelBackground)
		this.rootContainer.addChild(this.playerPowerLabelContainer)

		this.opponentPowerLabel = new PIXI.Text('', {
			fontFamily: 'Roboto',
		})
		this.opponentPowerLabel.anchor.set(0.5, 0.5)
		const opponentPowerLabelBackground = new PIXI.Sprite(TextureAtlas.getTexture('board/power-enemy'))
		opponentPowerLabelBackground.anchor.set(0, 0.5)
		opponentPowerLabelBackground.width = this.GAME_BOARD_ROW_WINDOW_FRACTION * this.getScreenHeight() / 2
		opponentPowerLabelBackground.height = this.GAME_BOARD_ROW_WINDOW_FRACTION * this.getScreenHeight() / 2
		this.opponentPowerLabel.position.set(opponentPowerLabelBackground.width / 2, 0)
		this.opponentPowerLabelContainer = new PIXI.Container()
		this.opponentPowerLabelContainer.addChild(this.opponentPowerLabel)
		this.opponentPowerLabelContainer.addChild(opponentPowerLabelBackground)
		this.rootContainer.addChild(this.opponentPowerLabelContainer)

		/* Smoke screen */
		this.selectableCardsSmokescreen = new PIXI.Sprite(TextureAtlas.getTexture('masks/black'))
		this.selectableCardsSmokescreen.zIndex = SELECTABLE_CARD_ZINDEX - 1
		this.rootContainer.addChild(this.selectableCardsSmokescreen)

		/* Modular initializations */
		inspectedCardRenderer.init()
		this.rootContainer.addChild(inspectedCardRenderer.container)
	}

	public tick(deltaTime: number, deltaTimeFraction: number): void {
		this.deltaTime = deltaTime
		this.deltaTimeFraction = deltaTimeFraction

		const unitCards = Core.player.cardHand.unitCards
		const sortedPlayerUnitCards = Core.player.cardHand.unitCards.filter(card => card !== Core.input.inspectedCard).slice().reverse()
		sortedPlayerUnitCards.forEach(renderedCard => {
			if (renderedCard === Core.input.inspectedCard) {
				return
			}

			this.updateCardStats(renderedCard)
			this.renderCard(renderedCard, unitCards, false, false)
		})

		const spellCards = Core.player.cardHand.spellCards
		const sortedPlayerSpellCards = Core.player.cardHand.spellCards.filter(card => card !== Core.input.inspectedCard).slice().reverse()
		sortedPlayerSpellCards.forEach(renderedCard => {
			if (renderedCard === Core.input.inspectedCard) {
				return
			}

			this.updateCardStats(renderedCard)
			this.renderCard(renderedCard, spellCards, false, true)
		})

		if (Core.opponent) {
			const opponentsUnitCards = Core.opponent.cardHand.unitCards
			const sortedOpponentUnitCards = Core.opponent.cardHand.unitCards.slice().reverse()
			sortedOpponentUnitCards.forEach(renderedCard => {
				if (renderedCard === Core.input.inspectedCard || renderedCard === Core.mainHandler.announcedCard) {
					return
				}

				this.updateCardStats(renderedCard)
				this.renderCard(renderedCard, opponentsUnitCards, true, false)
			})

			const opponentsSpellCards = Core.opponent.cardHand.spellCards
			const sortedOpponentSpellCards = Core.opponent.cardHand.spellCards.slice().reverse()
			sortedOpponentSpellCards.forEach(renderedCard => {
				if (renderedCard === Core.input.inspectedCard || renderedCard === Core.mainHandler.announcedCard) {
					return
				}

				this.updateCardStats(renderedCard)
				this.renderCard(renderedCard, opponentsSpellCards, true, true)
			})
		}

		this.renderTextLabels()
		this.renderGameBoard(Core.board)
		this.renderSelectableCards()
		playQueueRenderer.tick()
		inspectedCardRenderer.tick()
		announcedCardRenderer.tick()
		this.renderTargetingArrow()
	}

	private renderCard(card: RenderedCard, cardArray: RenderedCard[], isOpponent: boolean, isSpellHand: boolean): void {
		if (Core.input.grabbedCard && card === Core.input.grabbedCard.card) {
			this.renderCardInHand(card, cardArray.indexOf(card), cardArray.length, isOpponent, isSpellHand)
			const displayMode = this.renderGrabbedCard(card, Core.input.mousePosition)
			card.setDisplayMode(displayMode)
		} else if (!Core.input.grabbedCard && Core.input.hoveredCard && card === Core.input.hoveredCard.card) {
			this.renderCardInHand(card, cardArray.indexOf(card), cardArray.length, isOpponent, isSpellHand)
			this.renderHoveredCardInHand(card, isOpponent)
			card.setDisplayMode(CardDisplayMode.IN_HAND_HOVERED)
		} else {
			this.renderCardInHand(card, cardArray.indexOf(card), cardArray.length, isOpponent, isSpellHand)
			card.setDisplayMode(CardDisplayMode.IN_HAND)
		}
	}

	public resize(): void {
		this.debouncedResizedFunc()()
	}

	private debouncedResizedFunc(): () => void {
		return throttle(100, () => {
			const width = Math.max(1366, window.innerWidth * window.devicePixelRatio)
			this.pixi.renderer.resize(width * this.superSamplingLevel, window.innerHeight * window.devicePixelRatio * this.superSamplingLevel)
		})
	}

	public registerCard(card: RenderedCard): void {
		this.rootContainer.addChild(card.coreContainer)
		this.rootContainer.addChild(card.hitboxSprite)
	}

	public showCard(card: RenderedCard): void {
		card.coreContainer.visible = true
		card.hitboxSprite.visible = true
	}

	public hideCard(card: RenderedCard): void {
		card.coreContainer.visible = false
		card.hitboxSprite.visible = false
	}

	public destroyCard(card: RenderedCard): void {
		card.coreContainer.destroy({
			children: true,
		})
		this.rootContainer.removeChild(card.coreContainer)
		this.rootContainer.removeChild(card.hitboxSprite)
	}

	public registerGameBoardRow(row: RenderedGameBoardRow): void {
		this.rootContainer.addChild(row.container)
	}

	private getScreenWidth(): number {
		return this.pixi.view.width
	}

	private getScreenHeight(): number {
		return this.pixi.view.height
	}

	public updateCardStats(renderedCard: RenderedCard): void {
		// Empty for now
	}

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number, isOpponent: boolean, isSpellHand: boolean): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite
		const disabledOverlaySprite = renderedCard.cardDisabledOverlay

		const windowFraction = isOpponent ? this.OPPONENT_HAND_WINDOW_FRACTION : this.PLAYER_HAND_WINDOW_FRACTION
		const cardHeight = this.getScreenHeight() * windowFraction

		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		const unitHandFraction = 0.50
		const spellHandFraction = 0.20

		const containerFraction = isSpellHand ? spellHandFraction : unitHandFraction
		const containerWidth = Math.min(this.getScreenWidth() * containerFraction, cardHeight * this.CARD_ASPECT_RATIO * handSize)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = containerWidth / handSize
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		container.visible = true
		const targetPosition = {
			x: distanceToCenter * cardWidth + screenCenter,
			y: cardHeight * 0.5
		}

		if (isOpponent) {
			targetPosition.y += this.getScreenHeight() * this.OPPONENT_HAND_OFFSET_FRACTION
		} else {
			targetPosition.y = this.getScreenHeight() - targetPosition.y
		}

		if (isSpellHand) {
			targetPosition.x += this.getScreenWidth() * 0.5 / 2 + 125
		} else {
			targetPosition.x -= this.getScreenWidth() * 0.2 / 2 + 125
		}

		const isForcedTarget = Core.input.forcedTargetingMode &&
			!!Core.input.forcedTargetingMode.validTargets.find(forcedCard => forcedCard.targetCardId === renderedCard.id)

		renderedCard.cardDisabledOverlay.visible = !isCardPlayable(renderedCard) && !isForcedTarget

		if (renderedCard.displayMode === CardDisplayMode.IN_HAND || renderedCard.displayMode === CardDisplayMode.IN_HAND_HOVERED) {
			sprite.alpha += (1 - sprite.alpha) * this.deltaTimeFraction * 7
			container.position.x += (targetPosition.x - container.position.x) * this.deltaTimeFraction * 7
			container.position.y += (targetPosition.y - container.position.y) * this.deltaTimeFraction * 7
		} else {
			container.position.x = targetPosition.x
			container.position.y = targetPosition.y - cardHeight / 2 * (isOpponent ? -1 : 1)
		}
		container.zIndex = HAND_CARD_ZINDEX + (handPosition + 1) * 2

		hitboxSprite.position.set(targetPosition.x + sprite.position.x, targetPosition.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		disabledOverlaySprite.position.set(sprite.position.x, sprite.position.y)
		disabledOverlaySprite.scale = sprite.scale
		disabledOverlaySprite.zIndex = container.zIndex + 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard, isOpponent: boolean): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const disabledOverlaySprite = renderedCard.cardDisabledOverlay

		const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		if (isOpponent) {
			container.position.y = cardHeight * 0.5
		} else {
			container.position.y = this.getScreenHeight() - cardHeight * 0.5
		}

		container.zIndex = HOVERED_CARD_ZINDEX

		disabledOverlaySprite.position.set(sprite.position.x, sprite.position.y)
		disabledOverlaySprite.scale = sprite.scale
		disabledOverlaySprite.zIndex = container.zIndex + 1
	}

	public renderGrabbedCard(renderedCard: RenderedCard, mousePosition: Point): CardDisplayMode {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const disabledOverlaySprite = renderedCard.cardDisabledOverlay
		const hoveredRow = Core.board.rows.find(row => row.isHovered())

		let cardDisplayMode: CardDisplayMode
		if (renderedCard.type === CardType.UNIT && hoveredRow) {
			const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION * 0.905
			sprite.width = cardHeight * this.CARD_ASPECT_RATIO
			sprite.height = cardHeight
			cardDisplayMode = CardDisplayMode.ON_BOARD
		} else {
			cardDisplayMode = CardDisplayMode.IN_HAND
		}

		container.position.x = mousePosition.x
		container.position.y = mousePosition.y
		container.zIndex = GRABBED_CARD_ZINDEX

		disabledOverlaySprite.position.set(sprite.position.x, sprite.position.y)
		disabledOverlaySprite.scale = sprite.scale
		disabledOverlaySprite.zIndex = container.zIndex + 1

		return cardDisplayMode
	}

	public renderTextLabels(): void {
		/* Player name labels */
		const username = Core.player.player.username.split('#')[0]
		this.playerNameLabel.text = `${username}\n- Morale: ${Core.player.morale}\n- Mana: ${Core.player.spellMana}`
		if (Core.opponent) {
			const opponentUsername = Core.opponent.player.username.split('#')[0]
			this.opponentNameLabel.text = `${opponentUsername}\n- Morale: ${Core.opponent.morale}\n- Mana: ${Core.opponent.spellMana}`
		}

		/* Power labels */
		const getPowerFontSize = (value: number): number => {
			const string = value.toString()
			let returnValue = 40
			if (string.length === 2) {
				returnValue = 35
			} else if (string.length >= 3) {
				returnValue = 30
			}
			return returnValue * this.superSamplingLevel
		}

		const power = Core.board.getInsertedUnitsOwnedByPlayer(Core.player).map(unit => unit.card.stats.power).reduce((accumulator, value) => accumulator + value, 0)
		const opponentPower = Core.board.getInsertedUnitsOwnedByPlayer(Core.opponent).map(unit => unit.card.stats.power).reduce((accumulator, value) => accumulator + value, 0)
		this.playerPowerLabel.text = power.toString()
		this.opponentPowerLabel.text = opponentPower.toString()
		this.playerPowerLabel.style.fontSize = getPowerFontSize(power)
		this.opponentPowerLabel.style.fontSize = getPowerFontSize(opponentPower)
		if (power > opponentPower) {
			this.playerPowerLabel.style.fill = 0x77FF77
			this.opponentPowerLabel.style.fill = 0xFF7777
		} else if (opponentPower > power) {
			this.playerPowerLabel.style.fill = 0xFF7777
			this.opponentPowerLabel.style.fill = 0x77FF77
		} else {
			this.playerPowerLabel.style.fill = 0xCCCCCC
			this.opponentPowerLabel.style.fill = 0xCCCCCC
		}

		/* Action label */
		const labelPosition = Core.input.mousePosition.clone()
		this.actionLabel.position.copyFrom(labelPosition)
		this.actionLabel.style.lineHeight = 24
	}

	public renderGameBoard(gameBoard: RenderedGameBoard): void {
		let rows = gameBoard.rows.slice()
		const playerPowerLabelRow = Constants.GAME_BOARD_ROW_COUNT - 2
		const opponentPowerLabelRow = 1
		if (gameBoard.isInverted) {
			rows = rows.reverse()
		}
		for (let i = 0; i < rows.length; i++) {
			this.renderGameBoardRow(rows[i], i)
		}

		const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		const screenCenterX = this.getScreenWidth() / 2
		const screenCenterY = this.getScreenHeight() / 2

		const playerLabelTargetRowDistanceToCenter = playerPowerLabelRow - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5
		const opponentLabelTargetRowDistanceToCenter = opponentPowerLabelRow - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5
		const playerLabelRowY = screenCenterY + playerLabelTargetRowDistanceToCenter * rowHeight + this.getScreenHeight() * this.GAME_BOARD_OFFSET_FRACTION
		const opponentLabelRowY = screenCenterY + opponentLabelTargetRowDistanceToCenter * rowHeight + this.getScreenHeight() * this.GAME_BOARD_OFFSET_FRACTION
		this.playerPowerLabelContainer.position.set(screenCenterX + (rowHeight * this.CARD_ASPECT_RATIO) * 5.2, playerLabelRowY)
		this.opponentPowerLabelContainer.position.set(screenCenterX + (rowHeight * this.CARD_ASPECT_RATIO) * 5.2, opponentLabelRowY)
	}

	public renderGameBoardRow(gameBoardRow: RenderedGameBoardRow, rowIndex: number): void {
		const container = gameBoardRow.container
		const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		container.scale.set(rowHeight / gameBoardRow.getHeight())

		const screenCenterX = this.getScreenWidth() / 2
		const screenCenterY = this.getScreenHeight() / 2
		const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5
		const rowY = screenCenterY + verticalDistanceToCenter * rowHeight + this.getScreenHeight() * this.GAME_BOARD_OFFSET_FRACTION

		container.position.set(screenCenterX, rowY)
		gameBoardRow.sprite.tint = this.getBoardRowTint(gameBoardRow)

		for (let i = 0; i < gameBoardRow.cards.length; i++) {
			const unit = gameBoardRow.cards[i]
			this.updateCardStats(unit.card)
			this.renderUnit(unit, rowY, rowIndex, i, gameBoardRow.cards.length)
		}
	}

	private getBoardRowTint(row: RenderedGameBoardRow): BoardRowTint {
		if (isGrabbedCardPlayableToRow(row) || (Core.input.forcedTargetingMode && Core.input.forcedTargetingMode.isRowPotentialTarget(row))) {
			return row.isHovered() ? BoardRowTint.VALID_TARGET_HOVERED : BoardRowTint.VALID_TARGET
		}

		if ((Core.input.grabbedCard && !Core.input.grabbedCard.validTargetRows.includes(row)) || (Core.input.forcedTargetingMode && !Core.input.forcedTargetingMode.isRowPotentialTarget(row))) {
			return BoardRowTint.INVALID_TARGET
		}

		return BoardRowTint.NORMAL
	}

	public renderUnit(unit: RenderedUnit, rowY: number, rowIndex: number, unitIndex: number, unitCount: number): void {
		if (unit.card === Core.input.inspectedCard) {
			return
		}

		const container = unit.card.coreContainer
		const sprite = unit.card.sprite
		const hitboxSprite = unit.card.hitboxSprite
		const disabledOverlaySprite = unit.card.cardDisabledOverlay

		const screenCenterX = this.getScreenWidth() / 2
		const distanceToCenter = unitIndex - unitCount / 2 + 0.5

		const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION * 0.905
		const cardWidth = cardHeight * this.CARD_ASPECT_RATIO

		const targetPositionX = screenCenterX + distanceToCenter * cardWidth
		const targetPositionY = rowY

		let shadowUnitOffsetX = 0
		const shadowUnit = Core.input.limboShadowUnit || Core.input.hoveredShadowUnit
		if (shadowUnit && rowIndex === shadowUnit.rowIndex) {
			if (shadowUnit.unitIndex <= unitIndex) {
				shadowUnitOffsetX = cardWidth / 2
			} else {
				shadowUnitOffsetX = -cardWidth / 2
			}
		}

		if (unit.card.displayMode === CardDisplayMode.ON_BOARD) {
			sprite.alpha += (1 - sprite.alpha) * this.deltaTimeFraction * 2
			unit.card.powerText.alpha = sprite.alpha
			unit.card.armorText.alpha = sprite.alpha
			container.position.x += (targetPositionX - container.position.x + shadowUnitOffsetX) * this.deltaTimeFraction * 7
			container.position.y += (targetPositionY - container.position.y) * this.deltaTimeFraction * 7
		} else {
			container.visible = true
			container.position.x = targetPositionX
			container.position.y = targetPositionY
		}
		container.zIndex = UNIT_ZINDEX

		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		sprite.tint = this.getUnitTint(unit)
		disabledOverlaySprite.visible = false

		hitboxSprite.position.set(targetPositionX, targetPositionY)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		unit.card.setDisplayMode(CardDisplayMode.ON_BOARD)
	}

	private getUnitTint(unit: RenderedUnit): CardTint {
		const card = unit.card
		const hoveredCard = Core.input.hoveredCard ? Core.input.hoveredCard.card : null
		if (Core.input.grabbedCard && Core.input.grabbedCard.card === unit.card) {
			return CardTint.GRABBED
		}

		/* Current unit is a valid target for some order */
		if ((Core.input.forcedTargetingMode && Core.input.forcedTargetingMode.isUnitPotentialTarget(unit)) ||
			(Core.input.grabbedCard && Core.input.grabbedCard.mode === GrabbedCardMode.CARD_ORDER && Core.input.grabbedCard.validTargetCards.includes(unit.card))) {
			if (unit.owner === Core.opponent) {
				return hoveredCard === card ? CardTint.VALID_ENEMY_TARGET_HOVERED : CardTint.VALID_ENEMY_TARGET
			} else {
				return hoveredCard === card ? CardTint.VALID_ALLY_TARGET_HOVERED : CardTint.VALID_ALLY_TARGET
			}
		}

		if (Core.player.isTurnActive && !Core.input.grabbedCard && unit.owner === Core.player && Core.board.getValidOrdersForUnit(unit).length > 0) {
			return hoveredCard === card ? CardTint.HOVERED : CardTint.NORMAL
		}
		if (Core.opponent.isTurnActive && !Core.input.grabbedCard && unit.owner === Core.opponent && Core.board.getValidOrdersForUnit(unit).length > 0) {
			return hoveredCard === card ? CardTint.HOVERED : CardTint.NORMAL
		}

		return CardTint.INACTIVE
	}

	public renderTargetingArrow(): void {
		this.updateTargetingLabel(this.actionLabel)

		const grabbedCard = Core.input.grabbedCard
		const forcedTargeting = Core.input.forcedTargetingMode
		const targetingArrow = grabbedCard?.targetingLine || forcedTargeting?.targetingLine
		if ((!grabbedCard || grabbedCard.mode !== GrabbedCardMode.CARD_ORDER) && (!forcedTargeting || !forcedTargeting.source || Core.input.forcedTargetingCards.length > 0)) {
			this.actionLabel.text = ''
			return
		}

		let startingPosition
		if (grabbedCard) {
			startingPosition = grabbedCard.card.getVisualPosition()
		} else if (forcedTargeting && forcedTargeting.source) {
			startingPosition = forcedTargeting.source.getVisualPosition()
		}

		if (!startingPosition) {
			return
		}

		let snappingToTarget = false
		let targetPosition = Core.input.mousePosition
		if (Core.input.hoveredCard) {
			const validTargetCards = forcedTargeting?.validTargets.map(target => target.targetCardId) || grabbedCard?.validTargetCards.map(card => card.id)
			if (validTargetCards && validTargetCards.length > 0) {
				const target = Core.game.findRenderedCardById(validTargetCards.find(id => id === Core.input.hoveredCard.card.id))
				if (target) {
					targetPosition = target.getVisualPosition()
					snappingToTarget = true
				}
			}
		}

		let color = 0xFFFF00
		if (snappingToTarget) {
			color = 0x00FF00
		}

		targetingArrow.startingPoint.position.copyFrom(startingPosition)
		targetingArrow.startingPoint.clear()
		targetingArrow.startingPoint.beginFill(color, 1.0)
		targetingArrow.startingPoint.drawCircle(0, 0, 5)
		targetingArrow.startingPoint.endFill()
		targetingArrow.startingPoint.zIndex = TARGETING_ARROW_ZINDEX

		if (targetingArrow.targetPoint.position.equals({ x: 0, y: 0})) {
			targetingArrow.targetPoint.position.copyFrom(targetPosition)
		} else {
			const currentPosition = targetingArrow.targetPoint.position
			currentPosition.x += (targetPosition.x - currentPosition.x) * this.deltaTimeFraction * 15
			currentPosition.y += (targetPosition.y - currentPosition.y) * this.deltaTimeFraction * 15
		}
		targetingArrow.targetPoint.clear()
		targetingArrow.targetPoint.beginFill(color, 1.0)
		targetingArrow.targetPoint.drawCircle(0, 0, 5)
		targetingArrow.targetPoint.endFill()
		targetingArrow.targetPoint.zIndex = TARGETING_ARROW_ZINDEX

		targetingArrow.arrowLine.position.copyFrom(startingPosition)
		targetingArrow.arrowLine.clear()
		const iterations = 5
		for (let i = 0; i < iterations; i++) {
			targetingArrow.arrowLine.lineStyle(i + 1, color, (iterations + 1 - i) / (iterations + 1))
			const targetX = targetingArrow.targetPoint.position.x - startingPosition.x
			const targetY = targetingArrow.targetPoint.position.y - startingPosition.y
			const distance = Math.sqrt(Math.pow(targetX, 2) + Math.pow(targetY, 2))

			targetingArrow.arrowLine.bezierCurveTo(0, 0, targetX / 2, targetY / 2 - distance / 2, targetX, targetY)
			targetingArrow.arrowLine.moveTo(0, 0)
		}
		targetingArrow.arrowLine.zIndex = TARGETING_ARROW_ZINDEX
	}

	private updateTargetingLabel(label: RichText): void {
		label.style.fill = 0x55FF55

		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		if (Core.input.forcedTargetingMode) {
			label.text = Localization.get(Core.input.forcedTargetingMode.getDisplayedLabel())
			label.textVariables = Core.input.forcedTargetingMode.getDisplayedLabelVariables()
			return
		}

		const grabbedCard = Core.input.grabbedCard
		const grabbedUnit = grabbedCard ? Core.board.findUnitById(grabbedCard.card.id) : null
		if (!grabbedCard || !grabbedUnit || (!hoveredUnit && !hoveredRow)) {
			label.text = ''
			return
		}

		const validOrders = Core.board.getValidOrdersForUnit(grabbedUnit).sort((a, b) => a.targetMode - b.targetMode || a.targetType - b.targetType)
		const performedOrder = validOrders.find(order =>
			(hoveredCard && order.targetCardId === hoveredCard.id) ||
			(hoveredRow && Core.board.getRow(order.targetRowIndex) === hoveredRow))
		if (performedOrder) {
			label.text = Localization.get(performedOrder.targetLabel)
		} else {
			label.text = ''
		}
	}

	public renderSelectableCards(): void {
		const selectableCards = Core.input.forcedTargetingCards
		let chunks
		let windowFraction

		if (selectableCards.length <= 5) {
			chunks = [selectableCards]
			windowFraction = this.SELECTABLE_CARD_DISCOVER_WINDOW_FRACTION
		} else if (selectableCards.length <= 10) {
			chunks = Utils.splitArrayIntoChunks(selectableCards, 2)
			windowFraction = this.SELECTABLE_CARD_DISCOVER_WINDOW_FRACTION
		} else if (selectableCards.length <= 20) {
			chunks = Utils.splitArrayIntoChunks(selectableCards, 2)
			windowFraction = this.SELECTABLE_CARD_DECK_WINDOW_FRACTION
		} else {
			chunks = Utils.splitArrayIntoChunks(selectableCards, 3)
			windowFraction = this.SELECTABLE_CARD_DECK_WINDOW_FRACTION
		}

		if (selectableCards.length > 0 && store.state.gameStateModule.popupTargetingCardsVisible) {
			this.selectableCardsSmokescreen.visible = true
			this.selectableCardsSmokescreen.width = this.getScreenWidth()
			this.selectableCardsSmokescreen.height = this.getScreenHeight()
			this.selectableCardsSmokescreen.alpha = 0.75
		} else {
			this.selectableCardsSmokescreen.visible = false
		}

		for (let level = 0; level < chunks.length; level++) {
			for (let i = 0; i < chunks[level].length; i++) {
				const card = chunks[level][i]
				this.renderSelectableCard(card, i, chunks[level].length, level, chunks.length, selectableCards.length, windowFraction)
			}
		}
	}

	public renderSelectableCard(renderedCard: RenderedCard, handPosition: number, handSize: number, level: number, levelCount: number, totalCount: number, windowFraction: number): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		let sizeMod = 1.0
		if (renderedCard === MouseHover.getHoveredCard()) {
			sizeMod = 1.05
		}

		const cardHeight = this.getScreenHeight() * windowFraction

		sprite.width = cardHeight * this.CARD_ASPECT_RATIO * sizeMod
		sprite.height = cardHeight * sizeMod

		const containerFraction = 0.80
		const containerWidth = Math.min(this.getScreenWidth() * containerFraction, cardHeight * this.CARD_ASPECT_RATIO * handSize * 1.2)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = containerWidth / handSize
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		container.visible = Core.input.forcedTargetingMode ? store.state.gameStateModule.popupTargetingCardsVisible : true

		const targetPosition = {
			x: distanceToCenter * cardWidth + screenCenter,
			y: this.getScreenHeight() / 2 - cardHeight / 2
		}

		const effectiveLevel = level - (Math.min(levelCount - 1, 4) / 2)
		const levelOffset = effectiveLevel * (cardHeight * 1.1)

		targetPosition.y = this.getScreenHeight() - targetPosition.y

		renderedCard.setDisplayMode(CardDisplayMode.SELECTION)
		if (renderedCard === MouseHover.getHoveredCard()) {
			renderedCard.setDisplayMode(CardDisplayMode.SELECTION_HOVERED)
		} else {
			renderedCard.setDisplayMode(CardDisplayMode.SELECTION)
		}

		sprite.alpha += (1 - sprite.alpha) * this.deltaTimeFraction * 7
		container.position.x = targetPosition.x
		container.position.y = targetPosition.y - cardHeight / 2 + levelOffset
		container.zIndex = SELECTABLE_CARD_ZINDEX + handPosition * 2

		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1
	}

	public destroy(): void {
		TextureAtlas.clear()
		Core.particleSystem.destroy()
		this.pixi.destroy(true, {
			children: true,
			texture: true,
			baseTexture: true
		})
	}
}
