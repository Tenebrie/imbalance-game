import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Point = PIXI.Point

export default class Input {
	mouseDown: boolean = false
	mousePosition: Point = new Point()

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
		Core.renderer.grabCard()
	}

	private onMouseUp(event: MouseEvent) {
		this.mouseDown = false
		Core.renderer.releaseCard()
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
	}
}
