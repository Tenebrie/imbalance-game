import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@/shared/Constants'
import RenderedCard from '@/Pixi/models/RenderedCard'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import GameTurnPhase from '@/shared/enums/GameTurnPhase'
import RenderedButton from '@/Pixi/models/RenderedButton'
import CardType from '@/shared/enums/CardType'

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
			width: window.innerWidth * window.devicePixelRatio,
			height: window.innerHeight * window.devicePixelRatio,
			antialias: true,
			autoDensity: true,
			resolution: 1
		})

		this.pixi.stage.sortableChildren = true
		container.appendChild(this.pixi.view)
		this.container = container

		/* Time label */
		this.timeLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 0xFFFFFF
		})
		this.timeLabel.anchor.set(0, 0.5)
		this.timeLabel.position.set(10, this.getScreenHeight() / 2)
		this.pixi.stage.addChild(this.timeLabel)

		/* Action label */
		this.actionLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 0xFFFFFF
		})
		this.actionLabel.anchor.set(0.5, 1)
		this.actionLabel.zIndex = 85
		this.pixi.stage.addChild(this.actionLabel)

		/* Player name label */
		this.playerNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24,
			fill: 0xFFFFFF
		})
		this.playerNameLabel.anchor.set(0, 1)
		this.playerNameLabel.position.set(10, this.getScreenHeight() - 10)
		this.pixi.stage.addChild(this.playerNameLabel)

		/* Opponent player name */
		this.opponentNameLabel = new PIXI.Text('', {
			fontFamily: 'Arial',
			fontSize: 24,
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
			if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
				this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
			} else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
				this.renderHoveredCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
			} else {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
			}
		})

		if (Core.opponent) {
			const opponentCards = Core.opponent.cardHand.cards
			const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse()
			sortedOpponentCards.forEach(renderedCard => {
				this.renderCardInOpponentHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length)
			})
		}

		this.renderTextLabels()
		this.renderGameBoard(Core.board)
		this.renderTargetingArrow()
		this.renderQueuedAttacks()
		this.renderInspectedCard()
		this.renderUI()
	}

	public registerButton(button: RenderedButton): void {
		this.pixi.stage.addChild(button.container)
	}

	public unregisterButton(button: RenderedButton): void {
		this.pixi.stage.removeChild(button.container)
	}

	public registerCard(card: RenderedCard): void {
		this.pixi.stage.addChild(card.sprite)
		this.pixi.stage.addChild(card.hitboxSprite)
	}

	public unregisterCard(card: RenderedCard): void {
		this.pixi.stage.removeChild(card.sprite)
		this.pixi.stage.removeChild(card.hitboxSprite)
	}

	public registerGameBoardRow(row: RenderedGameBoardRow): void {
		this.pixi.stage.addChild(row.sprite)
	}

	private getScreenWidth(): number {
		return this.pixi.view.width
	}

	private getScreenHeight(): number {
		return this.pixi.view.height
	}

	public renderContainerInHand(container: PIXI.Container, handPosition: number, handSize: number, isOpponent: boolean): void {
		const windowFraction = isOpponent ? this.OPPONENT_HAND_WINDOW_FRACTION : this.PLAYER_HAND_WINDOW_FRACTION
		const cardHeight = this.getScreenHeight() * windowFraction
		container.width = cardHeight * this.CARD_ASPECT_RATIO
		container.height = cardHeight

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = container.width * Math.pow(0.95, handSize)
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		container.alpha = 1
		container.position.x = distanceToCenter * cardWidth + screenCenter
		container.position.y = cardHeight * 0.5
		container.rotation = 0
		container.zIndex = (handPosition + 1) * 2
		if (!isOpponent) {
			container.position.y = this.getScreenHeight() - container.position.y
		}
	}

	public renderHoveredContainerInHand(sprite: PIXI.Container, handPosition: number, handSize: number): void {
		const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * this.CARD_ASPECT_RATIO
		sprite.height = cardHeight

		const spriteNormalWidth = (this.getScreenHeight() * this.PLAYER_HAND_WINDOW_FRACTION) * this.CARD_ASPECT_RATIO

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = spriteNormalWidth * Math.pow(0.95, handSize)
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.alpha = 1
		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = this.getScreenHeight() - cardHeight * 0.5
		sprite.rotation = 0
		sprite.zIndex = 50
	}

	public renderGrabbedSprite(container: PIXI.Container, mousePosition: Point): void {
		const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		container.width = cardHeight * this.CARD_ASPECT_RATIO
		container.height = cardHeight

		container.alpha = 1
		container.position.x = mousePosition.x
		container.position.y = mousePosition.y
		container.rotation = 0
		container.zIndex = 100
	}

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const container = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderContainerInHand(container, handPosition, handSize, false)
		this.renderContainerInHand(hitboxSprite, handPosition, handSize, false)
		renderedCard.switchToCardMode()
		renderedCard.fixFontScaling()
		hitboxSprite.zIndex -= 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const container = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderHoveredContainerInHand(container, handPosition, handSize)
		this.renderContainerInHand(hitboxSprite, handPosition, handSize, false)
		renderedCard.switchToCardMode()
		renderedCard.fixFontScaling()
		hitboxSprite.zIndex -= 1
	}

	public renderGrabbedCard(renderedCard: RenderedCard, mousePosition: Point): void {
		this.renderGrabbedSprite(renderedCard.sprite, mousePosition)
		if (renderedCard.cardType === CardType.UNIT) {
			renderedCard.switchToUnitMode()
		} else {
			renderedCard.switchToCardMode()
		}
		renderedCard.fixFontScaling()
	}

	public renderCardInOpponentHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const container = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderContainerInHand(container, handPosition, handSize, true)
		this.renderContainerInHand(hitboxSprite, handPosition, handSize, true)
		renderedCard.switchToCardMode()
		renderedCard.fixFontScaling()
		hitboxSprite.zIndex -= 1
	}

	public renderTextLabels(): void {
		let phaseLabel = ''
		if (Core.game.turnPhase === GameTurnPhase.WAITING) {
			phaseLabel = 'Waiting for the game to start'
		} else if (Core.game.turnPhase === GameTurnPhase.FINISHED) {
			phaseLabel = 'Game finished!'
		} else {
			let phase = 'Unknown'
			if (Core.game.turnPhase === GameTurnPhase.DEPLOY) {
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
		this.playerNameLabel.text = `${Core.player.player.username}\nTime units available: ${Core.player.timeUnits}`
		if (Core.opponent) {
			this.opponentNameLabel.text = `${Core.opponent.player.username}\nTime units available: ${Core.opponent.timeUnits}`
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
		const sprite = gameBoardRow.sprite
		const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		sprite.scale.set(rowHeight / sprite.texture.height)

		const screenCenterX = this.getScreenWidth() / 2
		const screenCenterY = this.getScreenHeight() / 2
		const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5
		const rowY = screenCenterY + verticalDistanceToCenter * rowHeight + this.getScreenHeight() * this.GAME_BOARD_OFFSET_FRACTION

		sprite.alpha = 1
		sprite.position.set(screenCenterX, rowY)

		for (let i = 0; i < gameBoardRow.cards.length; i++) {
			const cardOnBoard = gameBoardRow.cards[i]
			this.renderCardOnBoard(cardOnBoard, rowY, i, gameBoardRow.cards.length)
		}
	}

	public renderCardOnBoard(cardOnBoard: RenderedCardOnBoard, rowY: number, unitIndex: number, unitCount: number): void {
		const sprite = cardOnBoard.card.sprite
		const hitboxSprite = cardOnBoard.card.hitboxSprite
		const screenCenterX = this.getScreenWidth() / 2
		const distanceToCenter = unitIndex - unitCount / 2 + 0.5
		const cardHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION
		const cardWidth = cardHeight * this.CARD_ASPECT_RATIO

		sprite.width = cardWidth
		sprite.height = cardHeight
		hitboxSprite.scale.copyFrom(sprite.scale)

		sprite.alpha = 1
		sprite.position.x = screenCenterX + distanceToCenter * hitboxSprite.width
		sprite.position.y = rowY
		sprite.zIndex = 2

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

		hitboxSprite.alpha = sprite.alpha
		hitboxSprite.position.copyFrom(sprite.position)
		hitboxSprite.zIndex = sprite.zIndex - 1

		cardOnBoard.card.switchToUnitMode()
		cardOnBoard.card.fixFontScaling()
	}

	public renderTargetingArrow(): void {
		const grabbedCard = Core.input.grabbedCard
		if (!grabbedCard || grabbedCard.targetingMode !== TargetingMode.CARD_ATTACK) {
			this.actionLabel.text = ''
			return
		}

		const targetingArrow = grabbedCard.targetingArrow
		const startingPosition = grabbedCard.card.hitboxSprite.position
		const targetPosition = Core.input.mousePosition

		targetingArrow.startingPoint.position.copyFrom(startingPosition)
		targetingArrow.startingPoint.clear()
		targetingArrow.startingPoint.beginFill(0xFFFF00, 0.8)
		targetingArrow.startingPoint.drawCircle(0, 0, 5)
		targetingArrow.startingPoint.endFill()
		targetingArrow.startingPoint.zIndex = 80

		targetingArrow.arrowLine.position.copyFrom(startingPosition)
		targetingArrow.arrowLine.clear()
		targetingArrow.arrowLine.lineStyle(2, 0xFFFF00, 0.8)
		targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y)
		targetingArrow.arrowLine.zIndex = 80

		targetingArrow.targetPoint.position.copyFrom(targetPosition)
		targetingArrow.targetPoint.clear()
		targetingArrow.targetPoint.beginFill(0xFFFF00, 0.8)
		targetingArrow.targetPoint.drawCircle(0, 0, 5)
		targetingArrow.targetPoint.endFill()
		targetingArrow.targetPoint.zIndex = 80

		if (Core.input.hoveredCard && Core.input.hoveredCard.owner !== Core.player) {
			this.actionLabel.text = 'Attack'
		} else {
			this.actionLabel.text = ''
		}
	}

	public renderQueuedAttacks(): void {
		Core.board.queuedAttacks.forEach(attack => {
			const targetingArrow = attack.targetingArrow
			const startingPosition = attack.attacker.card.getPosition()
			const targetPosition = attack.target.card.getPosition()

			targetingArrow.startingPoint.position.copyFrom(startingPosition)
			targetingArrow.startingPoint.clear()
			targetingArrow.startingPoint.beginFill(0x999999, 1.0)
			targetingArrow.startingPoint.drawCircle(0, 0, 5)
			targetingArrow.startingPoint.endFill()
			targetingArrow.startingPoint.zIndex = 75

			targetingArrow.arrowLine.position.copyFrom(startingPosition)
			targetingArrow.arrowLine.clear()
			targetingArrow.arrowLine.lineStyle(2, 0x999999, 1.0)
			targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y)
			targetingArrow.arrowLine.zIndex = 75

			targetingArrow.targetPoint.position.copyFrom(targetPosition)
			targetingArrow.targetPoint.clear()
			targetingArrow.targetPoint.beginFill(0x999999, 1.0)
			targetingArrow.targetPoint.drawCircle(0, 0, 5)
			targetingArrow.targetPoint.endFill()
			targetingArrow.targetPoint.zIndex = 75
		})
	}

	public renderInspectedCard(): void {
		const inspectedCard = Core.input.inspectedCard
		if (!inspectedCard) {
			return
		}

		const sprite = inspectedCard.sprite
		sprite.tint = 0xFFFFFF
		sprite.scale.set(1.0)
		sprite.alpha = 1
		sprite.position.x = this.getScreenWidth() / 2
		sprite.position.y = this.getScreenHeight() / 2
		sprite.zIndex = 100

		inspectedCard.switchToCardMode()
		inspectedCard.fixFontScaling()
	}

	public renderUI(): void {
		/* const endTurnButton = this.endTurnButton
		endTurnButton.container.position.set(this.getScreenWidth() - 100, this.getScreenHeight() / 2) */
	}

	public destroy(): void {
		this.pixi.stop()
		this.container.removeChild(this.pixi.view)
	}
}
