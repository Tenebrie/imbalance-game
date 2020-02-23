import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@/Pixi/shared/Constants'
import RenderedCard from '@/Pixi/board/RenderedCard'
import { GrabbedCardMode } from '@/Pixi/enums/GrabbedCardMode'
import RenderedGameBoard from '@/Pixi/board/RenderedGameBoard'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import CardType from '@/Pixi/shared/enums/CardType'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import Settings from '@/Pixi/Settings'
import CardTint from '@/Pixi/enums/CardTint'
import BoardRowTint from '@/Pixi/enums/BoardRowTint'
import Localization from '@/Pixi/Localization'
import MouseHover from '@/Pixi/input/MouseHover'
import RichText from '@/Pixi/render/RichText'

const UNIT_ZINDEX = 2
const TARGETING_ARROW_ZINDEX = 10
const HOVERED_CARD_ZINDEX = 95
const RESOLVING_CARD_ZINDEX = 100
const GRABBED_CARD_ZINDEX = 150
const INSPECTED_CARD_ZINDEX = 200

export default class Renderer {
	pixi: PIXI.Application
	rootContainer: PIXI.Container

	container: HTMLElement

	timeLabel: PIXI.Text
	actionLabel: RichText
	playerNameLabel: PIXI.Text
	opponentNameLabel: PIXI.Text
	playerPowerLabel: PIXI.Text
	opponentPowerLabel: PIXI.Text

	deltaTime: number
	deltaTimeFraction: number

	CARD_ASPECT_RATIO = 408 / 584
	GAME_BOARD_WINDOW_FRACTION = 0.7
	PLAYER_HAND_WINDOW_FRACTION = 0.20
	OPPONENT_HAND_WINDOW_FRACTION = 0.20
	HOVERED_HAND_WINDOW_FRACTION = 0.3
	GAME_BOARD_OFFSET_FRACTION = -0.075
	OPPONENT_HAND_OFFSET_FRACTION = -0.15
	GAME_BOARD_ROW_WINDOW_FRACTION = this.GAME_BOARD_WINDOW_FRACTION / Constants.GAME_BOARD_ROW_COUNT

	constructor(container: HTMLElement) {
		this.pixi = new PIXI.Application({
			width: window.innerWidth * window.devicePixelRatio * Settings.superSamplingLevel,
			height: window.innerHeight * window.devicePixelRatio * Settings.superSamplingLevel,
			antialias: false,
			autoDensity: true,
			transparent: true,
			resolution: 1
		})

		this.rootContainer = new PIXI.Container()
		this.rootContainer.sortableChildren = true
		this.pixi.stage.addChild(this.rootContainer)

		this.pixi.view.style.maxWidth = '100vw'
		this.pixi.view.style.maxHeight = '100vh'
		container.appendChild(this.pixi.view)
		this.container = container

		/* Time label */
		this.timeLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.timeLabel.anchor.set(0, 0.5)
		this.timeLabel.position.set(10, this.getScreenHeight() / 2)
		this.rootContainer.addChild(this.timeLabel)

		/* Action label */
		this.actionLabel = new RichText('Test text', 2000, {})
		this.actionLabel.zIndex = 85
		this.actionLabel.setFont(24 * Settings.superSamplingLevel, 12 * Settings.superSamplingLevel)
		this.rootContainer.addChild(this.actionLabel)

		/* Player name label */
		this.playerNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.playerNameLabel.anchor.set(0, 1)
		this.playerNameLabel.position.set(10, this.getScreenHeight() - 10)
		this.rootContainer.addChild(this.playerNameLabel)

		/* Opponent player name */
		this.opponentNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})

		this.opponentNameLabel.position.set(10, 10)
		this.rootContainer.addChild(this.opponentNameLabel)

		/* Power labels */
		this.playerPowerLabel = new PIXI.Text('', {
			fontFamily: 'Roboto',
			fontSize: 40 * Settings.superSamplingLevel,
			fill: 0xFFFFFF,
			align: 'left'
		})
		this.playerPowerLabel.anchor.set(0, 0.5)
		this.rootContainer.addChild(this.playerPowerLabel)

		this.opponentPowerLabel = new PIXI.Text('', {
			fontFamily: 'Roboto',
			fontSize: 40 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.opponentPowerLabel.anchor.set(0, 0.5)
		this.rootContainer.addChild(this.opponentPowerLabel)
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

			if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
				this.renderCardInHand(renderedCard, unitCards.indexOf(renderedCard), unitCards.length, false, false)
				const displayMode = this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
				renderedCard.setDisplayMode(displayMode)
			} else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
				this.renderCardInHand(renderedCard, unitCards.indexOf(renderedCard), unitCards.length, false, false)
				this.renderHoveredCardInHand(renderedCard)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HOVERED)
			} else {
				this.renderCardInHand(renderedCard, unitCards.indexOf(renderedCard), unitCards.length, false, false)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND)
			}
		})

		const spellCards = Core.player.cardHand.spellCards
		const sortedPlayerSpellCards = Core.player.cardHand.spellCards.filter(card => card !== Core.input.inspectedCard).slice().reverse()
		sortedPlayerSpellCards.forEach(renderedCard => {
			if (renderedCard === Core.input.inspectedCard) {
				return
			}

			if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
				this.renderCardInHand(renderedCard, spellCards.indexOf(renderedCard), spellCards.length, false, true)
				const displayMode = this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
				renderedCard.setDisplayMode(displayMode)
			} else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
				this.renderCardInHand(renderedCard, spellCards.indexOf(renderedCard), spellCards.length, false, true)
				this.renderHoveredCardInHand(renderedCard)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HOVERED)
			} else {
				this.renderCardInHand(renderedCard, spellCards.indexOf(renderedCard), spellCards.length, false, true)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND)
			}
		})

		if (Core.opponent) {
			const opponentsUnitCards = Core.opponent.cardHand.unitCards
			const sortedOpponentUnitCards = Core.opponent.cardHand.unitCards.slice().reverse()
			sortedOpponentUnitCards.forEach(renderedCard => {
				if (renderedCard === Core.input.inspectedCard || renderedCard === Core.mainHandler.announcedCard) {
					return
				}

				this.renderCardInHand(renderedCard, opponentsUnitCards.indexOf(renderedCard), opponentsUnitCards.length, true, false)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HIDDEN)
			})

			const opponentsSpellCards = Core.opponent.cardHand.spellCards
			const sortedOpponentSpellCards = Core.opponent.cardHand.spellCards.slice().reverse()
			sortedOpponentSpellCards.forEach(renderedCard => {
				if (renderedCard === Core.input.inspectedCard || renderedCard === Core.mainHandler.announcedCard) {
					return
				}

				this.renderCardInHand(renderedCard, opponentsSpellCards.indexOf(renderedCard), opponentsSpellCards.length, true, true)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HIDDEN)
			})
		}

		this.renderTextLabels()
		this.renderGameBoard(Core.board)
		this.renderTargetingArrow()
		this.renderInspectedCard()
		this.renderAnnouncedCard()
		this.renderResolveStack()
	}

	public resize(): void {
		this.pixi.renderer.resize(window.innerWidth * window.devicePixelRatio * Settings.superSamplingLevel, window.innerHeight * window.devicePixelRatio * Settings.superSamplingLevel)
	}

	public registerCard(card: RenderedCard): void {
		this.rootContainer.addChild(card.coreContainer)
		this.rootContainer.addChild(card.hitboxSprite)
	}

	public unregisterCard(card: RenderedCard): void {
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

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number, isOpponent: boolean, isSpellHand: boolean): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

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

		const isPlayable = (renderedCard.cardType === CardType.UNIT && Core.player.unitMana > 0) || (renderedCard.cardType === CardType.SPELL && Core.player.spellMana > 0)
		sprite.tint = isPlayable ? 0xFFFFFF : 0x999999

		if (renderedCard.cardType === CardType.SPELL) {
			renderedCard.powerText.style.fill = 0x0000AA
		}

		if (renderedCard.displayMode === CardDisplayMode.IN_HAND || renderedCard.displayMode === CardDisplayMode.IN_HAND_HOVERED || renderedCard.displayMode === CardDisplayMode.IN_HAND_HIDDEN) {
			sprite.alpha += (1 - sprite.alpha) * this.deltaTimeFraction * 7
			container.position.x += (targetPosition.x - container.position.x) * this.deltaTimeFraction * 7
			container.position.y += (targetPosition.y - container.position.y) * this.deltaTimeFraction * 7
		} else {
			container.position.x = targetPosition.x
			container.position.y = targetPosition.y - cardHeight / 2
		}
		container.zIndex = (handPosition + 1) * 2

		hitboxSprite.position.set(targetPosition.x + sprite.position.x, targetPosition.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite

		const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		container.position.y = this.getScreenHeight() - cardHeight * 0.5

		container.zIndex = HOVERED_CARD_ZINDEX
	}

	public renderGrabbedCard(renderedCard: RenderedCard, mousePosition: Point): CardDisplayMode {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const hoveredRow = Core.board.rows.find(row => row.isHovered())

		let cardDisplayMode: CardDisplayMode
		if (renderedCard.cardType === CardType.UNIT && hoveredRow) {
			const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
			sprite.width = cardHeight * this.CARD_ASPECT_RATIO
			sprite.height = cardHeight
			cardDisplayMode = CardDisplayMode.ON_BOARD
		} else {
			cardDisplayMode = CardDisplayMode.IN_HAND
		}

		container.position.x = mousePosition.x
		container.position.y = mousePosition.y
		container.zIndex = GRABBED_CARD_ZINDEX
		return cardDisplayMode
	}

	public renderTextLabels(): void {
		/* Player name labels */
		this.playerNameLabel.text = `${Core.player.player.username}\n- Morale: ${Core.player.morale}\n- Unit mana: ${Core.player.unitMana}\n- Spell mana: ${Core.player.spellMana}`
		if (Core.opponent) {
			this.opponentNameLabel.text = `${Core.opponent.player.username}\n- Morale: ${Core.opponent.morale}\n- Unit mana: ${Core.opponent.unitMana}\n- Spell mana: ${Core.opponent.spellMana}`
		}

		/* Power labels */
		const power = Core.board.getUnitsOwnedByPlayer(Core.player).map(unit => unit.card.power).reduce((accumulator, value) => accumulator + value, 0)
		const opponentPower = Core.board.getUnitsOwnedByPlayer(Core.opponent).map(unit => unit.card.power).reduce((accumulator, value) => accumulator + value, 0)
		this.playerPowerLabel.text = power.toString()
		this.opponentPowerLabel.text = opponentPower.toString()
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
		labelPosition.y -= 32
		this.actionLabel.position.copyFrom(labelPosition)
	}

	public renderGameBoard(gameBoard: RenderedGameBoard): void {
		let rows = gameBoard.rows.slice()
		let playerPowerLabelRow = Constants.GAME_BOARD_ROW_COUNT - 1
		let opponentPowerLabelRow = 0
		if (gameBoard.isInverted) {
			rows = rows.reverse()
			playerPowerLabelRow = 0
			opponentPowerLabelRow = Constants.GAME_BOARD_ROW_COUNT - 1
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
		this.playerPowerLabel.position.set(screenCenterX + (rowHeight * this.CARD_ASPECT_RATIO) * 5, playerLabelRowY)
		this.opponentPowerLabel.position.set(screenCenterX + (rowHeight * this.CARD_ASPECT_RATIO) * 5, opponentLabelRowY)
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
			const cardOnBoard = gameBoardRow.cards[i]
			this.renderCardOnBoard(cardOnBoard, rowY, i, gameBoardRow.cards.length)
		}
	}

	private getBoardRowTint(row: RenderedGameBoardRow): BoardRowTint {
		if ((Core.input.grabbedCard && Core.input.grabbedCard.validTargetRows.includes(row)) || (Core.input.forcedTargetingMode && Core.input.forcedTargetingMode.isRowPotentialTarget(row))) {
			if (row.owner === Core.player) {
				return row.isHovered() ? BoardRowTint.VALID_TARGET_PLAYER_HOVERED : BoardRowTint.VALID_TARGET_PLAYER
			} else if (row.owner === Core.opponent) {
				return row.isHovered() ? BoardRowTint.VALID_TARGET_OPPONENT_HOVERED : BoardRowTint.VALID_TARGET_OPPONENT
			} else {
				return row.isHovered() ? BoardRowTint.VALID_TARGET_NEUTRAL_HOVERED : BoardRowTint.VALID_TARGET_NEUTRAL
			}
		}

		if (row.owner === Core.player) {
			return BoardRowTint.NORMAL_PLAYER
		} else if (row.owner === Core.opponent) {
			return BoardRowTint.NORMAL_OPPONENT
		} else {
			return BoardRowTint.NORMAL_NEUTRAL
		}
	}

	public renderCardOnBoard(unit: RenderedCardOnBoard, rowY: number, unitIndex: number, unitCount: number): void {
		if (unit.card === Core.input.inspectedCard) {
			return
		}

		const container = unit.card.coreContainer
		const sprite = unit.card.sprite
		const hitboxSprite = unit.card.hitboxSprite

		const screenCenterX = this.getScreenWidth() / 2
		const distanceToCenter = unitIndex - unitCount / 2 + 0.5

		const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		const cardWidth = cardHeight * this.CARD_ASPECT_RATIO

		const targetPositionX = screenCenterX + distanceToCenter * cardWidth
		const targetPositionY = rowY

		if (unit.card.displayMode === CardDisplayMode.ON_BOARD) {
			sprite.alpha += (1 - sprite.alpha) * this.deltaTimeFraction * 7
			container.position.x += (targetPositionX - container.position.x) * this.deltaTimeFraction * 7
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

		unit.card.powerText.text = unit.card.power.toString()
		if (unit.card.power < unit.card.basePower) {
			unit.card.powerText.style.fill = 0x770000
		} else if (unit.card.power > unit.card.basePower) {
			unit.card.powerText.style.fill = 0x007700
		} else {
			unit.card.powerText.style.fill = 0x000000
		}

		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		unit.card.setDisplayMode(CardDisplayMode.ON_BOARD)
	}

	private getUnitTint(unit: RenderedCardOnBoard): CardTint {
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
		if (Core.input.forcedTargetingMode) {
			return
		}

		const grabbedCard = Core.input.grabbedCard
		if (!grabbedCard || grabbedCard.mode !== GrabbedCardMode.CARD_ORDER) {
			this.actionLabel.text = ''
			return
		}

		const targetingArrow = grabbedCard.targetingLine
		const startingPosition = grabbedCard.card.hitboxSprite.position
		const targetPosition = Core.input.mousePosition

		targetingArrow.startingPoint.position.copyFrom(startingPosition)
		targetingArrow.startingPoint.clear()
		targetingArrow.startingPoint.beginFill(0xFFFF00, 1.0)
		targetingArrow.startingPoint.drawCircle(0, 0, 5)
		targetingArrow.startingPoint.endFill()
		targetingArrow.startingPoint.zIndex = TARGETING_ARROW_ZINDEX

		targetingArrow.arrowLine.position.copyFrom(startingPosition)
		targetingArrow.arrowLine.clear()
		const iterations = 5
		for (let i = 0; i < iterations; i++) {
			targetingArrow.arrowLine.lineStyle(i + 1, 0xFFFF00, (iterations + 1 - i) / (iterations + 1))
			targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y)
			targetingArrow.arrowLine.moveTo(0, 0)
		}
		targetingArrow.arrowLine.lineStyle(2, 0xFFFF00, 0.8)
		targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y)
		targetingArrow.arrowLine.zIndex = TARGETING_ARROW_ZINDEX

		targetingArrow.targetPoint.position.copyFrom(targetPosition)
		targetingArrow.targetPoint.clear()
		targetingArrow.targetPoint.beginFill(0xFFFF00, 1.0)
		targetingArrow.targetPoint.drawCircle(0, 0, 5)
		targetingArrow.targetPoint.endFill()
		targetingArrow.targetPoint.zIndex = TARGETING_ARROW_ZINDEX
	}

	private updateTargetingLabel(label: RichText): void {
		label.style.fill = 0x55FF55

		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		if (Core.input.forcedTargetingMode) {
			label.text = Localization.getString(Core.input.forcedTargetingMode.getDisplayedLabel())
			label.textVariables = Core.input.forcedTargetingMode.getDisplayedLabelVariables()
			return
		}

		const grabbedCard = Core.input.grabbedCard
		const grabbedUnit = grabbedCard ? Core.board.findUnitById(grabbedCard.card.id) : null
		if (!grabbedCard || (!hoveredUnit && !hoveredRow)) {
			label.text = ''
			return
		}

		const validOrders = Core.board.getValidOrdersForUnit(grabbedUnit).sort((a, b) => a.targetMode - b.targetMode || a.targetType - b.targetType)
		const performedOrder = validOrders.find(order => (!order.targetUnit || order.targetUnit === hoveredUnit) && (!order.targetRow || order.targetRow === hoveredRow))
		if (performedOrder) {
			label.text = Localization.getString(performedOrder.targetLabel)
		} else {
			label.text = ''
		}
	}

	public renderInspectedCard(): void {
		const inspectedCard = Core.input.inspectedCard
		if (!inspectedCard) {
			return
		}

		const container = inspectedCard.coreContainer
		const sprite = inspectedCard.sprite

		sprite.tint = 0xFFFFFF
		sprite.scale.set(Settings.superSamplingLevel)
		container.position.x = this.getScreenWidth() / 2
		container.position.y = this.getScreenHeight() / 2
		container.zIndex = INSPECTED_CARD_ZINDEX

		if (inspectedCard.cardType === CardType.SPELL) {
			inspectedCard.powerText.style.fill = 0x0000AA
		} else {
			inspectedCard.powerText.style.fill = 0x000000
		}
		inspectedCard.powerText.text = inspectedCard.basePower.toString()

		inspectedCard.setDisplayMode(CardDisplayMode.INSPECTED)
	}

	public renderAnnouncedCard(): void {
		const announcedCard = Core.mainHandler.announcedCard
		if (!announcedCard) {
			return
		}

		const container = announcedCard.coreContainer
		const sprite = announcedCard.sprite
		sprite.alpha = 1
		sprite.tint = 0xFFFFFF
		sprite.scale.set(Settings.superSamplingLevel)
		container.visible = true
		container.zIndex = INSPECTED_CARD_ZINDEX

		if (announcedCard.displayMode !== CardDisplayMode.ANNOUNCED) {
			container.position.x = -sprite.width / 2
			container.position.y = this.getScreenHeight() / 2
			announcedCard.setDisplayMode(CardDisplayMode.ANNOUNCED)
		} else {
			const targetX = sprite.width / 2 + 50 * Settings.superSamplingLevel

			container.position.x += (targetX - container.position.x) * this.deltaTimeFraction * 7
			container.position.y = this.getScreenHeight() / 2
		}

		const hitboxSprite = announcedCard.hitboxSprite
		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1
	}

	public renderResolveStack(): void {
		for (let i = 0; i < Core.resolveStack.cards.length; i++) {
			const card = Core.resolveStack.cards[i]
			this.renderResolveStackCard(card, i)
		}
	}

	public renderResolveStackCard(card: RenderedCard, index: number): void {
		const container = card.coreContainer
		const sprite = card.sprite
		sprite.alpha = 1
		sprite.tint = 0xFFFFFF
		sprite.scale.set(Settings.superSamplingLevel)
		container.visible = true
		container.zIndex = RESOLVING_CARD_ZINDEX + index

		const cardHeight = this.getScreenHeight() * this.PLAYER_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		const horizontalOffset = 50 * Settings.superSamplingLevel * index

		let verticalOffset = this.getScreenHeight() * 0.20
		if (Core.opponent.isTurnActive) {
			verticalOffset *= -1
		}

		if (card.displayMode !== CardDisplayMode.RESOLVING) {
			container.position.x = -sprite.width / 2 + horizontalOffset
			container.position.y = this.getScreenHeight() / 2 + verticalOffset
			card.setDisplayMode(CardDisplayMode.RESOLVING)
		} else {
			const targetX = sprite.width / 2 + 50 * Settings.superSamplingLevel + horizontalOffset

			container.position.x += (targetX - container.position.x) * this.deltaTimeFraction * 7
			container.position.y = this.getScreenHeight() / 2 + verticalOffset
		}

		const hitboxSprite = card.hitboxSprite
		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1
	}

	public destroy(): void {
		this.pixi.stop()
		this.container.removeChild(this.pixi.view)
	}
}
