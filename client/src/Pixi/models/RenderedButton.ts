import * as PIXI from 'pixi.js'
import Settings from '@/Pixi/Settings'

export default class RenderedButton {
	onClick: () => void
	container: PIXI.Container

	renderedText: PIXI.Text
	textBackground: PIXI.Graphics

	get text() {
		return this.renderedText.text
	}
	set text(value: string) {
		this.renderedText.text = value
	}

	set backgroundColor(value: number) {
		this.container.removeChild(this.textBackground)
		this.textBackground = this.createBackground(this.text, value)
		this.container.addChild(this.textBackground)
	}

	constructor(text: string, position: PIXI.Point, onClick: () => void) {
		this.onClick = onClick

		this.renderedText = this.createText(text)
		this.textBackground = this.createBackground(text, 0x7777FF)

		this.container = new PIXI.Container()
		this.container.sortableChildren = true
		this.container.position.copyFrom(position)
		this.container.addChild(this.renderedText)
		this.container.addChild(this.textBackground)
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
		return this.textBackground.containsPoint(mousePosition)
	}

	public createText(text: string): PIXI.Text {
		const renderedText = new PIXI.Text(text, {
			fontFamily: 'Roboto',
			fontSize: 20 * Settings.superSamplingLevel,
			fill: 0x000000
		})
		renderedText.anchor.set(0.5)
		renderedText.zIndex = 1
		return renderedText
	}

	public createBackground(text: string, color: number): PIXI.Graphics {
		let textMetrics = PIXI.TextMetrics.measureText(text, new PIXI.TextStyle({
			fontFamily: 'Roboto',
			fontSize: 20 * Settings.superSamplingLevel
		}))
		const bounds = new PIXI.Rectangle(0, 0, textMetrics.width, textMetrics.height)
		bounds.pad(8 * Settings.superSamplingLevel, 4 * Settings.superSamplingLevel)

		const background = new PIXI.Graphics()
		background.beginFill(color)
		background.drawRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height)
		background.endFill()

		return background
	}
}
