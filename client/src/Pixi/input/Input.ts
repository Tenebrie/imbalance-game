import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@/Pixi/shared/enums/CardType'
import HoveredCard from '@/Pixi/models/HoveredCard'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import RenderedCard from '@/Pixi/board/RenderedCard'
import {CardLocation} from '@/Pixi/enums/CardLocation'
import {GrabbedCardMode} from '@/Pixi/enums/GrabbedCardMode'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import Settings from '@/Pixi/Settings'
import TargetType from '@/Pixi/shared/enums/TargetType'
import ForcedTargetingMode from '@/Pixi/models/ForcedTargetingMode'
import MouseHover from '@/Pixi/input/MouseHover'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'

const LEFT_MOUSE_BUTTON = 0
const RIGHT_MOUSE_BUTTON = 2

export default class Input {
	leftMouseDown: boolean = false
	rightMouseDown: boolean = false
	mousePosition: PIXI.Point = new PIXI.Point(-10000, -10000)
	cardLimbo: RenderedCard[] = []
	hoveredCard: HoveredCard | null = null
	grabbedCard: GrabbedCard | null = null
	inspectedCard: RenderedCard | null = null

	playableCards: ClientCardTarget[] = []
	forcedTargetingMode: ForcedTargetingMode | null = null

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
		const playerHandCards = Core.player.cardHand.allCards.slice().reverse()

		let hoveredCard: HoveredCard | null = null

		const hoveredCardOnBoard = gameBoardCards.find(cardOnBoard => cardOnBoard.card.isHovered()) || null
		if (hoveredCardOnBoard) {
			hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard)
		}

		const hoveredCardInHand = playerHandCards.find(card => card.isHovered()) || null
		if (hoveredCardInHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInHand, Core.player)
		}

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.isHovered()) {
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
			return
		}

		if (this.forcedTargetingMode && event.button === LEFT_MOUSE_BUTTON) {
			this.forcedTargetingMode.selectTarget()
			return
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
		if (this.forcedTargetingMode && this.forcedTargetingMode.isSelectedTargetValid() && event.button === LEFT_MOUSE_BUTTON) {
			this.forcedTargetingMode.confirmTarget()
			return
		}

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
		if (this.grabbedCard && this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY && windowHeight - this.mousePosition.y > windowHeight * Core.renderer.PLAYER_HAND_WINDOW_FRACTION * 1.5 &&
			((Core.player.unitMana === 0 && this.grabbedCard.card.cardType === CardType.UNIT) || (Core.player.spellMana === 0 && this.grabbedCard.card.cardType === CardType.SPELL))) {
			this.releaseCard()
		}
	}

	public grabCard(): void {
		if (!Core.player.isTurnActive) { return }

		const hoveredCard = this.hoveredCard
		if (!hoveredCard) { return }

		const card = hoveredCard.card

		if (hoveredCard.location === CardLocation.HAND && hoveredCard.owner === Core.player) {
			const validRows = this.playableCards.filter(playableCard => playableCard.sourceCard === card).map(playableCard => playableCard.targetRow)
			this.grabbedCard = GrabbedCard.cardPlay(card, validRows)
		} else if (hoveredCard.location === CardLocation.BOARD && hoveredCard.owner === Core.player && Core.game.turnPhase === GameTurnPhase.DEPLOY && Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id)).length > 0) {
			const validOrders = Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id))
			const validCards = validOrders.filter(order => order.targetType === TargetType.UNIT).map(order => order.targetUnit.card)
			const validRows = validOrders.filter(order => order.targetType === TargetType.BOARD_ROW).map(order => order.targetRow)
			this.grabbedCard = GrabbedCard.cardOrder(card, validCards, validRows)
		}
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

		if (this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY) {
			this.onCardPlay(this.grabbedCard.card)
		} else if (this.grabbedCard.mode === GrabbedCardMode.CARD_ORDER) {
			this.onUnitOrder(this.grabbedCard.card)
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
		const hoveredRow = MouseHover.getHoveredRow()
		if (!hoveredRow) {
			return
		}

		if (card.cardType === CardType.SPELL) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.cardType === CardType.UNIT) {
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, this.getCardInsertIndex(hoveredRow))
		}
		this.cardLimbo.push(card)
		Core.player.cardHand.destroyCard(card)
	}

	private onUnitOrder(orderedCard: RenderedCard): void {
		const orderedUnit = Core.board.findUnitById(orderedCard.id)!
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		const validOrders = Core.board.getValidOrdersForUnit(orderedUnit)
		const performedOrder = validOrders.find(order => (order.targetUnit && order.targetUnit === hoveredUnit) || (order.targetRow && order.targetRow === hoveredRow))
		if (performedOrder) {
			OutgoingMessageHandlers.sendUnitOrder(performedOrder)
		}
	}

	public restoreCardFromLimbo(cardMessage: CardMessage): RenderedCard {
		const cardInLimbo = this.cardLimbo.find(card => card.id === cardMessage.id)
		if (!cardInLimbo) {
			return
		}

		Core.registerCard(cardInLimbo)
		this.clearCardInLimbo(cardMessage)
		return cardInLimbo
	}

	public clearCardInLimbo(cardMessage: CardMessage): void {
		this.cardLimbo = this.cardLimbo.filter(card => card.id !== cardMessage.id)
	}

	public enableForcedTargetingMode(validTargets: ClientCardTarget[]): void {
		this.forcedTargetingMode = new ForcedTargetingMode(validTargets)
	}

	public disableForcedTargetingMode(): void {
		this.forcedTargetingMode = null
	}

	public clear() {
		// TODO: Remove event listeners
	}
}
