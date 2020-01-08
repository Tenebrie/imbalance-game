import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Constants from '@/shared/Constants'
import RenderedCard from '@/Pixi/models/RenderedCard'
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'

export default class Renderer {
	pixi: PIXI.Application
	container: Element

	CARD_SCALE = 0.3
	CARD_ON_BOARD_SCALE = 0.196
	HOVERED_CARD_SCALE = 0.7
	GAME_BOARD_ROW_SCALE = 0.4
	GAME_BOARD_ROW_HEIGHT = 292

	constructor(container: Element) {
		this.pixi = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight })
		this.pixi.stage.sortableChildren = true
		container.appendChild(this.pixi.view)
		this.container = container

		PIXI.Ticker.shared.add(() => this.tick())
	}

	private tick(): void {
		const playerCards = Core.player.cardHand.cards
		const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse()

		sortedPlayerCards.forEach(renderedCard => {
			if (renderedCard === Core.input.grabbedCard) {
				this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length)
				this.renderGrabbedCard(renderedCard, Core.input.mousePosition)
			} else if (renderedCard === Core.input.hoveredCard) {
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

		this.renderGameBoard(Core.gameBoard)
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

	public renderSpriteInHand(sprite: PIXI.Sprite, handPosition: number, handSize: number, isOpponent: boolean): void {
		sprite.scale.set(this.CARD_SCALE)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = sprite.width * Math.pow(0.95, handSize)
		const cardHeight = sprite.height * 0.5
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.alpha = 1
		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = cardHeight
		sprite.rotation = 0
		sprite.zIndex = (handPosition + 1) * 2
		if (!isOpponent) {
			sprite.position.y = this.getScreenHeight() - sprite.position.y
		}
	}

	public renderHoveredSpriteInHand(sprite: PIXI.Sprite, handPosition: number, handSize: number): void {
		sprite.scale.set(this.CARD_SCALE)

		const screenCenter = this.getScreenWidth() / 2
		const cardWidth = sprite.width * Math.pow(0.95, handSize)
		const cardHeight = (sprite.height / this.CARD_SCALE) * this.HOVERED_CARD_SCALE * 0.5
		const distanceToCenter = handPosition - ((handSize - 1) / 2)

		sprite.alpha = 1
		sprite.scale.set(this.HOVERED_CARD_SCALE)
		sprite.position.x = distanceToCenter * cardWidth + screenCenter
		sprite.position.y = this.getScreenHeight() - cardHeight
		sprite.rotation = 0
		sprite.zIndex = 50
	}

	public renderGrabbedSprite(sprite: PIXI.Sprite, mousePosition: Point): void {
		sprite.alpha = 1
		sprite.scale.set(this.CARD_SCALE)
		sprite.position.x = mousePosition.x
		sprite.position.y = mousePosition.y
		sprite.rotation = 0
		sprite.zIndex = 100
	}

	public renderCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderSpriteInHand(sprite, handPosition, handSize, false)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false)
		hitboxSprite.zIndex -= 1
	}

	public renderHoveredCardInHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderHoveredSpriteInHand(sprite, handPosition, handSize)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false)
		hitboxSprite.zIndex -= 1
	}

	public renderGrabbedCard(renderedCard: RenderedCard, mousePosition: Point): void {
		this.renderGrabbedSprite(renderedCard.sprite, mousePosition)
	}

	public renderCardInOpponentHand(renderedCard: RenderedCard, handPosition: number, handSize: number): void {
		const sprite = renderedCard.sprite
		const hitboxSprite = renderedCard.hitboxSprite

		this.renderSpriteInHand(sprite, handPosition, handSize, true)
		this.renderSpriteInHand(hitboxSprite, handPosition, handSize, true)
		hitboxSprite.zIndex -= 1
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
		const screenCenterX = this.getScreenWidth() / 2
		const screenCenterY = this.getScreenHeight() / 2
		const rowHeight = gameBoardRow.sprite.height
		const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5
		const rowY = screenCenterY + verticalDistanceToCenter * rowHeight

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

		sprite.scale.set(this.CARD_ON_BOARD_SCALE)
		hitboxSprite.scale.copyFrom(sprite.scale)

		sprite.alpha = 1
		sprite.position.x = screenCenterX + distanceToCenter * hitboxSprite.width
		sprite.position.y = rowY
		sprite.zIndex = 1

		hitboxSprite.alpha = sprite.alpha
		hitboxSprite.position.copyFrom(sprite.position)
		hitboxSprite.zIndex = sprite.zIndex - 1
	}

	public destroy(): void {
		this.pixi.stop()
		this.container.removeChild(this.pixi.view)
	}
}
