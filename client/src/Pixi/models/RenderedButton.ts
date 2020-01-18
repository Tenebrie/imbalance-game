import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'

export default class RenderedButton {
	container: PIXI.Container
	text: PIXI.Text
	textBackground: PIXI.Graphics
	onClick: () => void

	constructor(position: PIXI.Point, onClick: () => void) {
		this.text = this.createText()
		this.textBackground = this.createBackground()
		this.onClick = onClick

		this.container = new PIXI.Container()
		this.container.position.copyFrom(position)
		this.container.addChild(this.textBackground)
		this.container.addChild(this.text)
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
		return this.textBackground.containsPoint(mousePosition)
	}

	public createText(): PIXI.Text {
		const text = new PIXI.Text('End turn', {
			fontFamily: 'Arial',
			fontSize: 20,
			fill: 0x000000
		})
		text.anchor.set(0.5)
		return text
	}

	public createBackground(): PIXI.Graphics {
		let textMetrics = PIXI.TextMetrics.measureText('Your text', new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 20
		}))
		const bounds = new PIXI.Rectangle(0, 0, textMetrics.width, textMetrics.height)
		bounds.pad(8, 4)

		const background = new PIXI.Graphics()
		background.beginFill(0x00FFFF)
		background.drawRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height)
		background.endFill()

		return background
	}

	public unregister(): void {
		Core.unregisterButton(this)
	}
}
