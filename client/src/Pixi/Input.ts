import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@/shared/enums/CardType'
import HoveredCard from '@/Pixi/models/HoveredCard'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import RenderedCard from '@/Pixi/models/RenderedCard'
import { CardLocation } from '@/Pixi/enums/CardLocation'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@/shared/enums/GameTurnPhase'
import AttackOrder from '@/shared/models/AttackOrder'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import Point = PIXI.Point

export default class Input {
	mouseDown: boolean = false
	mousePosition: Point = new Point(-10000, -10000)
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
		})

		view.addEventListener('contextmenu', (event: MouseEvent) => {
			event.preventDefault()
			return false
		})
	}

	public updateCardHoverStatus() {
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

		this.hoveredCard = hoveredCard
	}

	private onMouseDown(event: MouseEvent) {
		if (event.button === 2 && this.grabbedCard) {
			this.releaseCard()
			return
		}

		if (this.inspectedCard) {
			this.inspectedCard = null
			return
		}

		if (event.button !== 0) {
			return
		}

		const buttons = Core.userInterface.buttons
		const pressedButton = buttons.find(button => button.isHovered(this.mousePosition))
		if (pressedButton) {
			Core.userInterface.pressedButton = pressedButton
			return
		}

		this.mouseDown = true
		this.grabCard()
	}

	private onMouseUp(event: MouseEvent) {
		const pressedButton = Core.userInterface.pressedButton
		if (pressedButton) {
			if (pressedButton.isHovered(this.mousePosition)) {
				pressedButton.onClick()
			}
			Core.userInterface.pressedButton = null
			return
		}

		if (event.button === 2 && this.hoveredCard) {
			this.inspectedCard = this.hoveredCard.card
		}

		if (event.button === 0) {
			this.mouseDown = false
			this.useGrabbedCard()
		}
	}

	public grabCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) { return }

		let targeting: TargetingMode
		if (hoveredCard.location === CardLocation.HAND && hoveredCard.owner === Core.player) {
			targeting = TargetingMode.CARD_PLAY
		} else if (hoveredCard.location === CardLocation.BOARD && hoveredCard.owner === Core.player && Core.game.turnPhase === GameTurnPhase.SKIRMISH) {
			targeting = TargetingMode.CARD_ATTACK
		} else {
			return
		}

		this.grabbedCard = new GrabbedCard(hoveredCard.card, targeting)
	}

	public useGrabbedCard(): void {
		if (!this.grabbedCard) { return }

		if (this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY) {
			this.onCardPlay(this.grabbedCard.card)
		} else if (this.grabbedCard.targetingMode === TargetingMode.CARD_ATTACK) {
			this.onCardAttack(this.grabbedCard.card)
		}

		this.releaseCard()
	}

	public releaseCard(): void {
		const grabbedCard = this.grabbedCard!
		grabbedCard.targetingArrow.destroy()
		this.hoveredCard = null
		this.grabbedCard = null
	}

	private getCardInsertIndex(hoveredRow: RenderedGameBoardRow): number {
		const hoveredUnit = this.hoveredCard
		if (!hoveredUnit || !hoveredRow.includesCard(hoveredUnit.card)) {
			return this.mousePosition.x > hoveredRow.sprite.position.x ? hoveredRow.cards.length : 0
		}
		let index = hoveredRow.getCardIndex(hoveredUnit.card)
		if (this.mousePosition.x > hoveredUnit.card.hitboxSprite.position.x) {
			index += 1
		}
		return index
	}

	private onCardPlay(card: RenderedCard): void {
		const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition))
		if (!hoveredRow) { return }

		if (card.cardType === CardType.SPELL) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.cardType === CardType.UNIT) {
			const index = this.getCardInsertIndex(hoveredRow)
			console.log(`Inserting at index ${index}`)
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, index)
		}
	}

	private onCardAttack(attackingCard: RenderedCard): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard || hoveredCard.owner === Core.player) {
			return
		}

		const attacker = Core.board.findCardById(attackingCard.id)!
		OutgoingMessageHandlers.sendUnitAttackOrders(new AttackOrder(attacker, hoveredCard))
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)

		const windowHeight = Core.renderer.pixi.view.height
		if (this.grabbedCard && this.grabbedCard.targetingMode === TargetingMode.CARD_PLAY && Core.player.timeUnits === 0 && windowHeight - this.mousePosition.y > windowHeight * Core.renderer.PLAYER_HAND_WINDOW_FRACTION * 1.5) {
			this.releaseCard()
		}
	}

	public clear() {
		// TODO: Remove event listeners
	}
}
