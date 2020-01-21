import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@/Pixi/shared/Constants'
import RenderedCard from '@/Pixi/models/RenderedCard'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import RenderedButton from '@/Pixi/models/RenderedButton'
import CardType from '@/Pixi/shared/enums/CardType'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import { CardLocation } from '@/Pixi/enums/CardLocation'
import UnitOrderType from '@/Pixi/shared/enums/UnitOrderType'
import Settings from '@/Pixi/Settings'
import Utils from '@/utils/Utils'

const UNIT_ZINDEX = 2
const UNIT_ORDER_ZINDEX = 3
const TARGETING_ARROW_ZINDEX = 10
const HOVERED_CARD_ZINDEX = 50
const GRABBED_CARD_ZINDEX = 150
const INSPECTED_CARD_ZINDEX = 200

export default class Renderer {
	pixi: PIXI.Application
	container: Element

	timeLabel: PIXI.Text
	actionLabel: PIXI.Text
	playerNameLabel: PIXI.Text
	opponentNameLabel: PIXI.Text

	CARD_ASPECT_RATIO = 408 / 584
	GAME_BOARD_WINDOW_FRACTION = 0.6
	PLAYER_HAND_WINDOW_FRACTION = 0.20
	OPPONENT_HAND_WINDOW_FRACTION = 0.10
	HOVERED_HAND_WINDOW_FRACTION = 0.3
	GAME_BOARD_OFFSET_FRACTION = -0.05
	GAME_BOARD_ROW_WINDOW_FRACTION = this.GAME_BOARD_WINDOW_FRACTION / Constants.GAME_BOARD_ROW_COUNT

	constructor(container: Element) {
		this.pixi = new PIXI.Application({
			width: window.innerWidth * window.devicePixelRatio * Settings.superSamplingLevel,
			height: window.innerHeight * window.devicePixelRatio * Settings.superSamplingLevel,
			antialias: false,
			autoDensity: true,
			resolution: 1
		})

		this.pixi.stage.sortableChildren = true
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
		this.pixi.stage.addChild(this.timeLabel)

		/* Action label */
		this.actionLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.actionLabel.anchor.set(0.5, 1)
		this.actionLabel.zIndex = 85
		this.pixi.stage.addChild(this.actionLabel)

		/* Player name label */
		this.playerNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.playerNameLabel.anchor.set(0, 1)
		this.playerNameLabel.position.set(10, this.getScreenHeight() - 10)
		this.pixi.stage.addChild(this.playerNameLabel)

		/* Opponent player name */
		this.opponentNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24 * Settings.superSamplingLevel,
			fill: 0xFFFFFF
		})
		this.opponentNameLabel.position.set(10, 10)
		this.pixi.stage.addChild(this.opponentNameLabel)

		/* Register the ticker */
		PIXI.Ticker.shared.add(() => this.tick())
	}

	private tick(): void {
		const playerCards = Core.player.cardHand.cards
		const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse()

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
				if (renderedCard === Core.input.inspectedCard) {
					return
				}

				this.renderCardInHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length, true)
				renderedCard.setDisplayMode(CardDisplayMode.IN_HAND_HIDDEN)
			})
		}

		this.renderTextLabels()
		this.renderGameBoard(Core.board)
		this.renderTargetingArrow()
		this.renderQueuedOrders()
		this.renderInspectedCard()
	}

	public registerButton(button: RenderedButton): void {
		this.pixi.stage.addChild(button.container)
	}

	public unregisterButton(button: RenderedButton): void {
		this.pixi.stage.removeChild(button.container)
	}

	public registerCard(card: RenderedCard): void {
		this.pixi.stage.addChild(card.coreContainer)
		this.pixi.stage.addChild(card.hitboxSprite)
	}

	public unregisterCard(card: RenderedCard): void {
		this.pixi.stage.removeChild(card.coreContainer)
		this.pixi.stage.removeChild(card.hitboxSprite)
	}

	public registerGameBoardRow(row: RenderedGameBoardRow): void {
		this.pixi.stage.addChild(row.container)
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

		container.position.x = distanceToCenter * cardWidth + screenCenter
		container.position.y = cardHeight * 0.5
		container.zIndex = (handPosition + 1) * 2

		if (!isOpponent) {
			container.position.y = this.getScreenHeight() - container.position.y
		}

		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard): void {
		const container = renderedCard.coreContainer
		const sprite = renderedCard.sprite

		const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		container.position.y = cardHeight * 0.5
		container.position.y = this.getScreenHeight() - container.position.y
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
			if (Core.game.turnPhase === GameTurnPhase.TURN_START || Core.game.turnPhase === GameTurnPhase.DEPLOY || Core.game.turnPhase === GameTurnPhase.TURN_END) {
				phase = 'Deploy'
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

	public renderCardOnBoard(cardOnBoard: RenderedCardOnBoard, rowY: number, unitIndex: number, unitCount: number): void {
		if (cardOnBoard.card === Core.input.inspectedCard) {
			return
		}

		const container = cardOnBoard.card.coreContainer
		const sprite = cardOnBoard.card.sprite
		const hitboxSprite = cardOnBoard.card.hitboxSprite

		const screenCenterX = this.getScreenWidth() / 2
		const distanceToCenter = unitIndex - unitCount / 2 + 0.5

		const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		const cardWidth = cardHeight * this.CARD_ASPECT_RATIO

		container.position.x = screenCenterX + distanceToCenter * cardWidth
		container.position.y = rowY
		container.zIndex = UNIT_ZINDEX

		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		sprite.tint = 0xFFFFFF
		if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
			sprite.tint = 0xBFBFBF
		}

		if (Core.game.turnPhase === GameTurnPhase.SKIRMISH && cardOnBoard.owner === Core.player) {
			sprite.tint = 0xBBFFBB
			if (Core.input.grabbedCard && cardOnBoard.card === Core.input.grabbedCard.card) {
				sprite.tint = 0x99BB99
			} else if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
				sprite.tint = 0x4CFE4C
			}
		}

		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		cardOnBoard.card.setDisplayMode(CardDisplayMode.ON_BOARD)
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
		const grabbedCard = Core.input.grabbedCard
		if (!grabbedCard) {
			this.actionLabel.text = ''
			return
		}

		const sourceUnit = Core.board.findUnitById(grabbedCard.card.id)
		if (!sourceUnit) {
			this.actionLabel.text = ''
			return
		}

		const colorInfo = 0x55FF55
		const colorError = 0xFF5555
		const hoveredCard = Core.input.hoveredCard
		if (hoveredCard && hoveredCard.location === CardLocation.BOARD && grabbedCard.card !== hoveredCard.card) {
			const targetUnit = Core.board.findUnitById(hoveredCard.card.id)!
			if (sourceUnit.owner === targetUnit.owner) {
				label.text = ''
			} else if (!sourceUnit.isTargetInRange(targetUnit)) {
				label.text = 'Target is too far!'
				label.style.fill = colorError
			} else if (Core.board.queuedOrders.find(order => order.orderedUnit === sourceUnit && order.targetUnit === targetUnit)) {
				label.text = 'Cancel attack'
				label.style.fill = colorInfo
			} else {
				label.text = 'Attack'
				label.style.fill = colorInfo
			}
			return
		}

		const hoveredRow = Core.board.rows.find(row => row.isHovered(Core.input.mousePosition))
		if (hoveredRow && sourceUnit.rowIndex !== hoveredRow.index) {
			const distance = Math.abs(sourceUnit.rowIndex - hoveredRow.index)
			const maxMoveDistance = 1
			if (distance > maxMoveDistance) {
				label.text = 'Row is too far'
				label.style.fill = colorError
			} else if (Core.board.queuedOrders.find(order => order.orderedUnit === sourceUnit && order.targetRow === hoveredRow)) {
				label.text = 'Cancel move'
				label.style.fill = colorInfo
			} else {
				label.text = 'Move'
				label.style.fill = colorInfo
			}
			return
		}

		this.actionLabel.text = ''
	}

	public renderQueuedOrders(): void {
		const queuedAttacks = Core.board.queuedOrders.filter(order => order.type === UnitOrderType.ATTACK)
		const queuedMoves = Core.board.queuedOrders.filter(order => order.type === UnitOrderType.MOVE)

		queuedAttacks.forEach(attackOrder => {
			const targetingLine = attackOrder.targetingLine
			const startingPosition = attackOrder.orderedUnit.card.getPosition()
			const targetPosition = attackOrder.targetUnit!.card.getPosition()

			let fillColor = 0xBBBBBB
			const hoveredCard = Core.input.hoveredCard
			if (hoveredCard && hoveredCard.card === attackOrder.orderedUnit.card) {
				fillColor = 0xFFFFFF
			} else if (hoveredCard && hoveredCard.card === attackOrder.targetUnit!.card) {
				fillColor = 0xFF3333
			}

			targetingLine.startingPoint.position.copyFrom(startingPosition)
			targetingLine.startingPoint.clear()
			targetingLine.startingPoint.beginFill(0x999999, 1.0)
			targetingLine.startingPoint.drawCircle(0, 0, 5 * Settings.superSamplingLevel)
			targetingLine.startingPoint.endFill()
			targetingLine.startingPoint.zIndex = UNIT_ORDER_ZINDEX

			targetingLine.arrowLine.position.copyFrom(startingPosition)
			targetingLine.arrowLine.clear()
			targetingLine.arrowLine.lineStyle(2 * Settings.superSamplingLevel, fillColor, 1.0)
			targetingLine.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y)
			targetingLine.arrowLine.zIndex = UNIT_ORDER_ZINDEX

			targetingLine.targetPoint.position.copyFrom(targetPosition)
			targetingLine.targetPoint.clear()
			targetingLine.targetPoint.beginFill(fillColor, 1.0)
			targetingLine.targetPoint.drawCircle(0, 0, 5 * Settings.superSamplingLevel)
			targetingLine.targetPoint.endFill()
			targetingLine.targetPoint.zIndex = UNIT_ORDER_ZINDEX
		})

		queuedMoves.forEach(moveOrder => {
			const cardPosition = moveOrder.orderedUnit.card.getPosition()
			const targetRowPosition = moveOrder.targetRow!.container.position

			let tintColor = 0xFFFFFF
			const hoveredCard = Core.input.hoveredCard
			if (hoveredCard && hoveredCard.card === moveOrder.orderedUnit.card) {
				tintColor = 0xCCCCCC
			}

			moveOrder.targetingArrow.arrowSprite.position.copyFrom(cardPosition)
			moveOrder.targetingArrow.arrowSprite.zIndex = UNIT_ORDER_ZINDEX
			moveOrder.targetingArrow.arrowSprite.height = moveOrder.orderedUnit.card.sprite.height
			moveOrder.targetingArrow.arrowSprite.width = moveOrder.orderedUnit.card.sprite.height * this.CARD_ASPECT_RATIO

			moveOrder.targetingArrow.arrowSprite.tint = tintColor
			moveOrder.targetingArrow.arrowSprite.rotation = Math.PI
			if (targetRowPosition.y < cardPosition.y) {
				moveOrder.targetingArrow.arrowSprite.rotation = 0
			}
		})
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

		inspectedCard.setDisplayMode(CardDisplayMode.INSPECTED)
	}

	public destroy(): void {
		this.pixi.stop()
		this.container.removeChild(this.pixi.view)
	}
}
