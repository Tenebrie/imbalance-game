import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@/Pixi/shared/enums/CardType'
import HoveredCard from '@/Pixi/models/HoveredCard'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import RenderedCard from '@/Pixi/models/RenderedCard'
import { CardLocation } from '@/Pixi/enums/CardLocation'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import ClientUnitOrder from '@/Pixi/models/ClientUnitOrder'
import Settings from '@/Pixi/Settings'

const LEFT_MOUSE_BUTTON = 0
const RIGHT_MOUSE_BUTTON = 2

export default class Input {
	leftMouseDown: boolean = false
	rightMouseDown: boolean = false
	mousePosition: PIXI.Point = new PIXI.Point(-10000, -10000)
	hoveredCard: HoveredCard | null = null
	grabbedCard: GrabbedCard | null = null
	inspectedCard: RenderedCard | null = null

	constructor() {
		const view = Core.renderer.pixi.view

		view.addEventListener('mousedown', (event: MouseEvent) => {
			this.onMouseDown(event)
		})

		view.addEventListener('mouseup', (event: MouseEvent) => {
			this.onMouseUp(event)
		})

		view.addEventListener('mousemove', (event: MouseEvent) => {
			this.onMouseMove(event)
			this.updateCardHoverStatus()
			if (this.rightMouseDown) { this.inspectCard() }
		})

		document.addEventListener('contextmenu', (event: MouseEvent) => {
			event.preventDefault()
			return false
		})
	}

	public tick(): void {
		this.updateCardHoverStatus()
	}

	public updateCardHoverStatus(): void {
		const gameBoardCards = Core.board.rows.map(row => row.cards).flat()
		const playerHandCards = Core.player.cardHand.cards.slice().reverse()

		let hoveredCard: HoveredCard | null = null

		const hoveredCardOnBoard = gameBoardCards.find(cardOnBoard => cardOnBoard.card.isHovered(this.mousePosition)) || null
		if (hoveredCardOnBoard) {
			hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard)
		}

		const hoveredCardInHand = playerHandCards.find(card => card.isHovered(this.mousePosition)) || null
		if (hoveredCardInHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInHand, Core.player)
		}

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.isHovered(this.mousePosition)) {
			hoveredCard = HoveredCard.fromAnnouncedCard(Core.mainHandler.announcedCard)
		}

		this.hoveredCard = hoveredCard
	}

	private onMouseDown(event: MouseEvent) {
		if (this.inspectedCard) {
			return
		}

		if (event.button === RIGHT_MOUSE_BUTTON && this.grabbedCard) {
			this.releaseCard()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON && this.hoveredCard && this.hoveredCard.card === Core.mainHandler.announcedCard) {
			Core.mainHandler.skipAnimation()
		}

		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = true
			this.grabCard()
		} else if (event.button === RIGHT_MOUSE_BUTTON) {
			this.rightMouseDown = true
			this.inspectCard()
		}
	}

	private onMouseUp(event: MouseEvent) {
		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = false
			this.useGrabbedCard()
		} else if (event.button === RIGHT_MOUSE_BUTTON) {
			this.rightMouseDown = false
			this.inspectedCard = null
		}
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new PIXI.Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
		this.mousePosition.x *= window.devicePixelRatio * Settings.superSamplingLevel
		this.mousePosition.y *= window.devicePixelRatio * Settings.superSamplingLevel

		const windowHeight = Core.renderer.pixi.view.height
		if (this.grabbedCard && this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY && Core.player.timeUnits === 0 && windowHeight - this.mousePosition.y > windowHeight * Core.renderer.PLAYER_HAND_WINDOW_FRACTION * 1.5) {
			this.releaseCard()
		}
	}

	public grabCard(): void {
		if (!Core.player.isTurnActive) { return }

		const hoveredCard = this.hoveredCard
		if (!hoveredCard) { return }

		let targeting: TargetingMode
		if (hoveredCard.location === CardLocation.HAND && hoveredCard.owner === Core.player) {
			targeting = TargetingMode.CARD_PLAY
		} else if (hoveredCard.location === CardLocation.BOARD && hoveredCard.owner === Core.player && Core.game.turnPhase === GameTurnPhase.DEPLOY) {
			targeting = TargetingMode.CARD_ORDER
		} else {
			return
		}

		this.grabbedCard = new GrabbedCard(hoveredCard.card, targeting)
	}

	public inspectCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) {
			this.inspectedCard = null
			return
		}

		this.inspectedCard = hoveredCard.card
	}

	public useGrabbedCard(): void {
		if (!this.grabbedCard) {
			return
		}

		if (this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY) {
			this.onCardPlay(this.grabbedCard.card)
		} else if (this.grabbedCard.targetingMode === TargetingMode.CARD_ORDER) {
			this.onCardOrder(this.grabbedCard.card)
		}

		this.releaseCard()
	}

	public releaseCard(): void {
		const grabbedCard = this.grabbedCard!
		grabbedCard.targetingLine.destroy()
		this.grabbedCard = null
		this.updateCardHoverStatus()
	}

	private getCardInsertIndex(hoveredRow: RenderedGameBoardRow): number {
		const hoveredUnit = this.hoveredCard
		if (!hoveredUnit || !hoveredRow.includesCard(hoveredUnit.card)) {
			return this.mousePosition.x > hoveredRow.container.position.x ? hoveredRow.cards.length : 0
		}
		let index = hoveredRow.getCardIndex(hoveredUnit.card)
		if (this.mousePosition.x > hoveredUnit.card.hitboxSprite.position.x) {
			index += 1
		}
		return index
	}

	private onCardPlay(card: RenderedCard): void {
		const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition))
		if (!hoveredRow) {
			return
		}

		if (card.cardType === CardType.SPELL) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.cardType === CardType.UNIT) {
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, this.getCardInsertIndex(hoveredRow))
		}
	}

	private onCardOrder(orderedCard: RenderedCard): void {
		const hoveredCard = this.hoveredCard
		const orderedUnit = Core.board.findUnitById(orderedCard.id)!
		if (hoveredCard && hoveredCard.location === CardLocation.BOARD && hoveredCard.owner !== Core.player) {
			const hoveredUnit = Core.board.findUnitById(hoveredCard.card.id)!
			OutgoingMessageHandlers.sendUnitOrder(ClientUnitOrder.attack(orderedUnit, hoveredUnit))
			return
		}

		const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition))
		if (hoveredRow && orderedUnit.rowIndex !== hoveredRow.index) {
			const distance = Math.abs(orderedUnit.rowIndex - hoveredRow.index)
			const maxMoveDistance = 1
			if (distance <= maxMoveDistance) {
				OutgoingMessageHandlers.sendUnitOrder(ClientUnitOrder.move(orderedUnit, hoveredRow))
			}
		}
	}

	public clear() {
		// TODO: Remove event listeners
	}
}
