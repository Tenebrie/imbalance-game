import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@/shared/enums/CardType'
import RenderedCard from '@/Pixi/models/RenderedCard'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import Point = PIXI.Point

export default class Input {
	mouseDown: boolean = false
	mousePosition: Point = new Point()
	hoveredCard: RenderedCard | null = null
	grabbedCard: RenderedCard | null = null

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
		this.mouseDown = true
		this.grabCard()
	}

	private onMouseUp(event: MouseEvent) {
		this.mouseDown = false
		this.releaseCard()
	}

	public grabCard(): void {
		if (!this.hoveredCard) { return }

		this.grabbedCard = this.hoveredCard
	}

	public releaseCard(): void {
		if (!this.grabbedCard) { return }

		const hoveredRow = Core.gameBoard.rows.find(row => row.isHovered(this.mousePosition))
		if (hoveredRow) {
			const card = this.grabbedCard
			if (card.cardType === CardType.SPELL) {
				OutgoingMessageHandlers.sendSpellCardPlayed(this.grabbedCard)
			} else if (card.cardType === CardType.UNIT) {
				OutgoingMessageHandlers.sendUnitCardPlayed(this.grabbedCard, hoveredRow, hoveredRow.cards.length)
			}
		}

		this.hoveredCard = null
		this.grabbedCard = null
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
	}

	public clear() {

	}
}
