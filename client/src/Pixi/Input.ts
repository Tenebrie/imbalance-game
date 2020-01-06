import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import Point = PIXI.Point

export default class Input {
	mousePosition: Point = new Point()

	constructor() {
		const view = Core.renderer.pixi.view

		view.addEventListener('mousemove', (event: MouseEvent) => {
			this.onMouseMove(event)
		})
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
	}
}
