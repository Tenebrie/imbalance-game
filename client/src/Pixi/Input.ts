import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/models/RenderedCard'
import OutgoingMessageHandlers from '@/Pixi/OutgoingMessageHandlers'
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

		OutgoingMessageHandlers.sendCardPlayed(this.grabbedCard)
		this.hoveredCard = null
		this.grabbedCard = null
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
	}
}
