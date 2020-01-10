import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@/shared/enums/CardType'
import HoveredCard from '@/Pixi/models/HoveredCard'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import RenderedCard from '@/Pixi/models/RenderedCard'
import { CardLocation } from '@/Pixi/enums/CardLocation'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import Point = PIXI.Point

export default class Input {
	mouseDown: boolean = false
	mousePosition: Point = new Point(-1000, -10000)
	hoveredCard: HoveredCard | null = null
	grabbedCard: GrabbedCard | null = null

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
	}

	private onMouseDown(event: MouseEvent) {
		// if (event.button !== 0) { return }

		this.mouseDown = true
		this.grabCard()
	}

	private onMouseUp(event: MouseEvent) {
		// if (event.button !== 0) { return }

		this.mouseDown = false
		this.releaseCard()
	}

	public grabCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) { return }

		let targeting: TargetingMode
		if (hoveredCard.location === CardLocation.HAND && hoveredCard.owner === Core.player) {
			targeting = TargetingMode.CARD_PLAY
		} else if (hoveredCard.location === CardLocation.BOARD && hoveredCard.owner === Core.player && hoveredCard.card.initiative === 0) {
			targeting = TargetingMode.CARD_ATTACK
		} else {
			return
		}
		this.grabbedCard = new GrabbedCard(hoveredCard.card, targeting)
	}

	public releaseCard(): void {
		if (!this.grabbedCard) { return }

		if (this.grabbedCard.targeting === TargetingMode.CARD_PLAY) {
			this.onCardPlay(this.grabbedCard.card)
		} else if (this.grabbedCard.targeting === TargetingMode.CARD_ATTACK) {
			this.onCardAttack(this.grabbedCard.card)
		}

		this.hoveredCard = null
		this.grabbedCard = null
	}

	private onCardPlay(card: RenderedCard): void {
		const hoveredRow = Core.board.rows.find(row => row.isHovered(this.mousePosition))
		if (!hoveredRow) { return }

		if (card.cardType === CardType.SPELL) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.cardType === CardType.UNIT) {
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, hoveredRow.cards.length)
		}
	}

	private onCardAttack(card: RenderedCard): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard || hoveredCard.owner === Core.player) {
			return
		}

		OutgoingMessageHandlers.sendUnitAttackOrder(card, hoveredCard.card)
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
	}

	public clear() {
		// TODO: Remove event listeners
	}
}
