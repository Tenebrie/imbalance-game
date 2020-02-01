import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@/Pixi/shared/Constants'
import RenderedCard from '@/Pixi/board/RenderedCard'
import {TargetingMode} from '@/Pixi/enums/TargetingMode'
import RenderedGameBoard from '@/Pixi/board/RenderedGameBoard'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import CardType from '@/Pixi/shared/enums/CardType'
import {CardDisplayMode} from '@/Pixi/enums/CardDisplayMode'
import {CardLocation} from '@/Pixi/enums/CardLocation'
import Settings from '@/Pixi/Settings'
import CardTint from '@/Pixi/enums/CardTint'

const UNIT_ZINDEX = 2
const UNIT_ORDER_ZINDEX = 3
const TARGETING_ARROW_ZINDEX = 10
const HOVERED_CARD_ZINDEX = 50
const GRABBED_CARD_ZINDEX = 150
const INSPECTED_CARD_ZINDEX = 200

export default class Renderer {
	pixi: PIXI.Application
	rootContainer: PIXI.Container

	container: HTMLElement

	timeLabel: PIXI.Text
	actionLabel: PIXI.Text
	playerNameLabel: PIXI.Text
	opponentNameLabel: PIXI.Text

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
		this.actionLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.actionLabel.anchor.set(0.5, 1)
		this.actionLabel.zIndex = 85
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
	}

	public tick(deltaTime: number, deltaTimeFraction: number): void {
		this.deltaTime = deltaTime
		this.deltaTimeFraction = deltaTimeFraction

		const playerCards = Core.player.cardHand.cards
		const sortedPlayerCards = Core.player.cardHand.cards.filter(card => card !== Core.input.inspectedCard).slice().reverse()

		sortedPlayerCards.forEach(renderedCard => {
			if (renderedCard === Core.input.inspectedCard) {
				return
			}

			if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false)
				const displayMode = this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
				renderedCard.setDisplayMode(displayMode)
			} else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false)
				this.renderHoveredCardInHand(renderedCard)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HOVERED)
			} else {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length, false)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND)
			}
		})

		if (Core.opponent) {
			const opponentCards = Core.opponent.cardHand.cards
			const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse()
			sortedOpponentCards.forEach(renderedCard => {
				if (renderedCard === Core.input.inspectedCard || renderedCard === Core.mainHandler.announcedCard) {
					return
				}

				this.renderCardInHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length, true)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HIDDEN)
			})
		}

		this.renderTextLabels()
		this.renderGameBoard(Core.board)
		this.renderTargetingArrow()
		this.renderInspectedCard()
		this.renderAnnouncedCard()
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

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number, isOpponent: boolean): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		const windowFraction = isOpponent ? this.OPPONENT_HAND_WINDOW_FRACTION : this.PLAYER_HAND_WINDOW_FRACTION
		const cardHeight = this.getScreenHeight() * windowFraction

		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = cardHeight * this.CARD_ASPECT_RATIO * Math.pow(0.95, handSize)
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
		const hoveredRow = Core.board.rows.find(row => row.isHovered(Core.input.mousePosition))

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
		let phaseLabel = ''
		if (Core.game.turnPhase === GameTurnPhase.BEFORE_GAME) {
			phaseLabel = 'Waiting for the game to start'
		} else if (Core.game.turnPhase === GameTurnPhase.AFTER_GAME) {
			phaseLabel = 'Game finished!'
		} else {
			let phase = 'Unknown'
			if (Core.game.turnPhase === GameTurnPhase.TURN_START) {
				phase = 'Turn start'
			} else if (Core.game.turnPhase === GameTurnPhase.DEPLOY) {
				phase = 'Deploy'
			} else if (Core.game.turnPhase === GameTurnPhase.TURN_END) {
				phase = 'Turn end'
			} else if (Core.game.turnPhase === GameTurnPhase.SKIRMISH) {
				phase = 'Skirmish'
			} else if (Core.game.turnPhase === GameTurnPhase.COMBAT) {
				phase = 'Combat'
			}
			phaseLabel = `Turn phase is ${phase}`
		}
		this.timeLabel.text = `${phaseLabel}\nTime of day is ${Core.game.currentTime} out of ${Core.game.maximumTime}`

		/* Player name labels */
		this.playerNameLabel.text = `${Core.player.player.username} (${Core.player.timeUnits})\nMorale: ${Core.player.morale}`
		if (Core.opponent) {
			this.opponentNameLabel.text = `${Core.opponent.player.username} (${Core.opponent.timeUnits})\nMorale: ${Core.opponent.morale}`
		}

		/* Action label */
		const labelPosition = Core.input.mousePosition.clone()
		labelPosition.y -= 16
		this.actionLabel.position.copyFrom(labelPosition)
	}

	public renderGameBoard(gameBoard: RenderedGameBoard): void {
		let rows = gameBoard.rows.slice()
		if (gameBoard.isInverted) {
			rows = rows.reverse()
		}
		for (let i = 0; i < rows.length; i++) {
			this.renderGameBoardRow(rows[i], i)
		}
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

		for (let i = 0; i < gameBoardRow.cards.length; i++) {
			const cardOnBoard = gameBoardRow.cards[i]
			this.renderCardOnBoard(cardOnBoard, rowY, i, gameBoardRow.cards.length)
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

	private getUnitTint(unit: RenderedCardOnBoard): number {
		if (Core.input.grabbedCard && Core.input.grabbedCard.targetingMode === TargetingMode.CARD_ORDER && Core.input.grabbedCard.validTargetCards.includes(unit.card)) {
			return CardTint.VALID_TARGET
		}

		if (Core.input.grabbedCard && Core.input.grabbedCard.card !== unit.card) {
			return CardTint.NORMAL
		}

		const unitsValidOrders = Core.board.getValidOrdersForUnit(unit)
		if (Core.game.turnPhase === GameTurnPhase.DEPLOY && unit.owner === Core.player && Core.player.isTurnActive && unitsValidOrders.length > 0) {
			if (Core.input.grabbedCard && unit.card === Core.input.grabbedCard.card) {
				return CardTint.GRABBED
			} else if (Core.input.hoveredCard && unit.card === Core.input.hoveredCard.card) {
				return CardTint.HOVERED_VALID_TARGET
			}
			return CardTint.VALID_TARGET
		}

		if (Core.input.hoveredCard && unit.card === Core.input.hoveredCard.card) {
			return CardTint.HOVERED
		}

		return CardTint.NORMAL
	}

	public renderTargetingArrow(): void {
		const grabbedCard = Core.input.grabbedCard
		if (!grabbedCard || grabbedCard.targetingMode !== TargetingMode.CARD_ORDER) {
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

		this.updateTargetingLabel(this.actionLabel)
	}

	private updateTargetingLabel(label: PIXI.Text): void {
		label.style.fill = 0x55FF55

		const grabbedCard = Core.input.grabbedCard
		if (!grabbedCard) {
			label.text = ''
			return
		}

		const sourceUnit = Core.board.findUnitById(grabbedCard.card.id)
		if (!sourceUnit) {
			label.text = ''
			return
		}

		const hoveredCard = Core.input.hoveredCard
		if (hoveredCard && hoveredCard.location === CardLocation.BOARD && Core.input.grabbedCard.validTargetCards.includes(hoveredCard.card)) {
			label.text = 'Attack'
			return
		}

		const hoveredRow = Core.board.rows.find(row => row.isHovered(Core.input.mousePosition))
		if (hoveredRow && Core.input.grabbedCard.validTargetRows.includes(hoveredRow)) {
			label.text = 'Move'
			return
		}

		label.text = ''
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

		inspectedCard.powerText.style.fill = 0x000000
		inspectedCard.powerText.text = inspectedCard.basePower.toString()
		inspectedCard.attackText.style.fill = 0x000000
		inspectedCard.attackText.text = inspectedCard.baseAttack.toString()

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

	public destroy(): void {
		this.pixi.stop()
		this.container.removeChild(this.pixi.view)
	}
}
