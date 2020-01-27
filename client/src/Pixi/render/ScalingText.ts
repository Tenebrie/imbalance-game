import * as PIXI from 'pixi.js'

export default class ScalingText extends PIXI.Container {
	private texts: PIXI.Text[]
	private currentText: string
	private currentStyle: PIXI.TextStyle
	private currentAnchor: PIXI.Point

	private get currentFontSize() {
		return this.currentStyle.fontSize as number
	}
	private set currentFontSize(value: number) {
		this.currentStyle.fontSize = value
	}
	private get currentLineHeight() {
		return this.currentStyle.lineHeight as number
	}
	private set currentLineHeight(value: number) {
		this.currentStyle.lineHeight = value
	}

	get text() {
		return this.currentText
	}
	set text(value: string) {
		this.updateText(value)
	}

	get anchor() {
		return this.currentAnchor
	}
	set anchor(value: PIXI.Point) {
		this.updateAnchor(value)
	}

	get style() {
		const parent = this
		return {
			get fontSize() {
				return parent.currentStyle.fontSize as number
			},
			set fontSize(value: number) {
				parent.updateFont(value, parent.currentLineHeight)
			},
			get lineHeight() {
				return parent.currentStyle.fontSize as number
			},
			set lineHeight(value: number) {
				parent.updateFont(parent.currentFontSize, value)
			},
			get fill() {
				return parent.currentStyle.fill as number
			},
			set fill(value: number) {
				parent.updateFill(value)
			}
		}
	}

	constructor(text: string, style: PIXI.TextStyle) {
		super()

		this.texts = []
		this.currentText = text
		this.currentStyle = style
		this.currentAnchor = new PIXI.Point()

		this.createNewText()
	}

	public scaleFont(factor: number): void {
		this.updateFont(this.currentFontSize * factor, this.currentLineHeight * factor)
	}

	private updateText(text: string): void {
		if (text === this.currentText) { return }

		this.currentText = text
		while (this.texts.length > 0) {
			this.removeChild(this.texts.shift()!)
		}
		this.createNewText()
	}

	private updateFill(fill: number): void {
		if (fill === this.style.fill) { return }

		this.currentStyle.fill = fill
		this.texts.forEach(text => {
			text.style.fill = fill
		})
	}

	public updateFont(fontSize: number, lineHeight: number): void {
		if (fontSize === this.currentFontSize && lineHeight === this.currentLineHeight) { return }

		this.currentFontSize = fontSize
		this.currentLineHeight = lineHeight
		this.texts.forEach(text => {
			text.visible = false
		})

		const matchingText = this.texts.find(text => text.style.fontSize === fontSize && text.style.lineHeight === lineHeight)
		if (matchingText) {
			matchingText.visible = true
		} else {
			this.createNewText()
		}
	}

	private updateAnchor(anchor: PIXI.Point): void {
		if (anchor.equals(this.currentAnchor)) { return }

		this.currentAnchor = anchor
		this.texts.forEach(text => {
			text.anchor = anchor
		})
	}

	private createNewText(): void {
		while (this.texts.length > 4) {
			this.removeChild(this.texts.shift()!)
		}

		const newText = new PIXI.Text(this.currentText, new PIXI.TextStyle(this.currentStyle))
		newText.anchor = this.currentAnchor
		this.texts.push(newText)
		this.addChild(newText)
	}
}
