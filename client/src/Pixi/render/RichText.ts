import * as PIXI from 'pixi.js'
import Utils, { insertRichTextVariables } from '@/utils/Utils'
import ScalingText from '@/Pixi/render/ScalingText'
import RichTextVariables from '@shared/models/RichTextVariables'
import RichTextBackground from '@/Pixi/render/RichTextBackground'
import RichTextAlign from '@/Pixi/render/RichTextAlign'

enum SegmentType {
	TEXT = 'TEXT',
	ITALIC = 'ITALIC',
	HIGHLIGHT = 'HIGHLIGHT',
	OPENING_TAG = 'OPENING_TAG',
	CLOSING_TAG = 'CLOSING_TAG',
	WORD_SEPARATOR = 'WORD_SEPARATOR',
	LINE_SEPARATOR = 'LINE_SEPARATOR',
}

interface ParsingStateTransitionTrigger {
	state: SegmentType
	token: string
}

interface ParsingStateTransitionAction {
	state: SegmentType
	insertedSegment?: SegmentType
	postSegment?: SegmentType
}

interface Segment {
	type: SegmentType
	data?: string
}

interface RichTextStyle {
	fill: number
	fontSize: number
	baseFontSize: number
	lineHeight: number
	dropShadow: boolean
	dropShadowBlur: number
}

export default class RichText extends PIXI.Container {
	private source: string
	private fill: number
	private fontSize: number
	private baseFontSize: number
	private lineHeight: number
	private maxWidth: number
	private dropShadow: boolean
	private dropShadowBlur: number

	private variables: RichTextVariables
	segments: { text: ScalingText; basePosition: PIXI.Point; lineIndex: number }[]
	background: RichTextBackground
	private __horizontalAlign: RichTextAlign = RichTextAlign.CENTER
	private __verticalAlign: RichTextAlign = RichTextAlign.END
	private __textLineCount = 0

	constructor(text: string, maxWidth: number, variables: RichTextVariables) {
		super()
		this.source = text
		this.fill = 0xcccccc
		this.fontSize = 18
		this.baseFontSize = 18
		this.lineHeight = 24
		this.dropShadow = false
		this.dropShadowBlur = 0
		this.maxWidth = maxWidth
		this.segments = []
		this.variables = variables
		this.renderText()
	}

	get text(): string {
		return this.source
	}
	set text(value: string) {
		if (this.source === value) {
			return
		}

		this.source = value
		this.renderText()
	}

	get textVariables(): RichTextVariables {
		return this.variables
	}
	set textVariables(value: RichTextVariables) {
		if (this.variables === value || JSON.stringify(this.variables) === JSON.stringify(value)) {
			return
		}
		this.variables = value
		this.renderText()
	}

	get horizontalAlign(): RichTextAlign {
		return this.__horizontalAlign
	}
	set horizontalAlign(value: RichTextAlign) {
		if (this.__horizontalAlign === value) {
			return
		}

		this.__horizontalAlign = value
		this.renderText()
	}

	get verticalAlign(): RichTextAlign {
		return this.__verticalAlign
	}
	set verticalAlign(value: RichTextAlign) {
		if (this.__verticalAlign === value) {
			return
		}

		this.__verticalAlign = value
		this.renderText()
	}

	get lines(): number {
		return this.__textLineCount
	}

	get style(): RichTextStyle {
		const parent = this
		return {
			get fill(): number {
				return parent.fill
			},
			set fill(value: number) {
				if (value === parent.fill) {
					return
				}
				parent.fill = value
				parent.renderText()
			},
			get fontSize(): number {
				return parent.fontSize
			},
			set fontSize(value: number) {
				if (value === parent.fontSize) {
					return
				}
				parent.fontSize = value
				parent.renderText()
			},
			get baseFontSize(): number {
				return parent.baseFontSize
			},
			set baseFontSize(value: number) {
				if (value === parent.baseFontSize) {
					return
				}
				parent.baseFontSize = value
				parent.renderText()
			},
			get lineHeight() {
				return parent.lineHeight
			},
			set lineHeight(value: number) {
				if (value === parent.lineHeight) {
					return
				}
				parent.lineHeight = value
				parent.renderText()
			},

			get dropShadow(): boolean {
				return parent.dropShadow
			},
			set dropShadow(value: boolean) {
				if (value === parent.dropShadow) {
					return
				}
				parent.dropShadow = value
				parent.renderText()
			},

			get dropShadowBlur(): number {
				return parent.dropShadowBlur
			},
			set dropShadowBlur(value: number) {
				if (value === parent.dropShadowBlur) {
					return
				}
				parent.dropShadowBlur = value
				parent.renderText()
			},
		}
	}

	public setBackground(background: RichTextBackground): void {
		this.background = background
	}

	public scaleFont(factor: number): void {
		this.setFont(this.fontSize * factor, this.lineHeight)
	}

	public setFont(fontSize: number, lineHeight: number): void {
		if (this.fontSize === fontSize && this.lineHeight === lineHeight) {
			return
		}

		this.fontSize = fontSize
		this.lineHeight = lineHeight
		const SCALE_MODIFIER = this.fontSize / 18
		this.segments.forEach((segment) => {
			const heightModifier = (lineHeight - 24) * segment.lineIndex * SCALE_MODIFIER
			segment.text.position.set(
				Math.round(segment.basePosition.x * SCALE_MODIFIER),
				Math.round(segment.basePosition.y * SCALE_MODIFIER + heightModifier)
			)
			segment.text.updateFont(fontSize, lineHeight)
		})
	}

	public renderText(): void {
		while (this.children.length > 0) {
			this.removeChildAt(0)
		}

		let linesRendered = 0
		const oldFontSize = this.fontSize
		const oldLineHeight = this.lineHeight

		this.fontSize = 18
		this.lineHeight = 24

		const SCALE_MODIFIER = this.fontSize / this.baseFontSize

		const replacedText = insertRichTextVariables(this.text || '', this.variables)
		const chars = Array.from(replacedText)

		const segments: Segment[] = []

		let currentState = SegmentType.TEXT
		let currentData = ''

		const stateSegmentType: Map<SegmentType, SegmentType> = new Map<SegmentType, SegmentType>()
		stateSegmentType.set(SegmentType.TEXT, SegmentType.TEXT)
		stateSegmentType.set(SegmentType.HIGHLIGHT, SegmentType.HIGHLIGHT)

		const stateTransitions: Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction> = new Map<
			ParsingStateTransitionTrigger,
			ParsingStateTransitionAction
		>()

		stateTransitions.set(
			{ state: SegmentType.TEXT, token: ' ' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.WORD_SEPARATOR }
		)
		stateTransitions.set(
			{ state: SegmentType.TEXT, token: '\n' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.LINE_SEPARATOR }
		)
		stateTransitions.set(
			{ state: SegmentType.TEXT, token: '_' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.ITALIC }
		)
		stateTransitions.set(
			{ state: SegmentType.TEXT, token: '*' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.HIGHLIGHT }
		)
		stateTransitions.set({ state: SegmentType.TEXT, token: '<' }, { state: SegmentType.OPENING_TAG, insertedSegment: SegmentType.TEXT })
		stateTransitions.set({ state: SegmentType.OPENING_TAG, token: '/' }, { state: SegmentType.CLOSING_TAG })
		stateTransitions.set(
			{ state: SegmentType.OPENING_TAG, token: '>' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.OPENING_TAG }
		)
		stateTransitions.set(
			{ state: SegmentType.CLOSING_TAG, token: '>' },
			{ state: SegmentType.TEXT, insertedSegment: SegmentType.CLOSING_TAG }
		)

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i]
			const trigger = { state: currentState, token: char }
			const action = this.getStateTransition(stateTransitions, trigger)
			if (!action) {
				currentData += char
				continue
			}

			if (action.insertedSegment && currentData) {
				segments.push({ type: action.insertedSegment, data: currentData })
			}
			if (action.postSegment) {
				segments.push({ type: action.postSegment })
			}
			currentState = action.state
			currentData = ''
		}
		segments.push({ type: currentState, data: currentData || '' })

		const contextPosition = new PIXI.Point(0, 0)
		let contextHighlight = false
		let contextItalic = false
		let contextColor = this.fill
		const contextColorStack: number[] = []
		let contextConditionStatus = true
		const contextConditionStack: boolean[] = []
		let currentLine: { text: ScalingText; basePosition: PIXI.Point }[] = []

		const newLine = () => {
			currentLine.forEach((renderedSegment) => {
				if (this.__horizontalAlign === RichTextAlign.CENTER) {
					renderedSegment.basePosition.x -= contextPosition.x / 2
				} else if (this.__horizontalAlign === RichTextAlign.END) {
					renderedSegment.basePosition.x -= contextPosition.x
				}
			})

			contextPosition.x = 0
			contextPosition.y += this.lineHeight
			currentLine = []
			linesRendered += 1
		}

		const insertText = (text: string) => {
			const style = new PIXI.TextStyle({
				fontFamily: Utils.getFont(text),
				fontSize: this.fontSize,
				fontStyle: contextItalic ? 'italic' : 'normal',
				padding: contextItalic ? 8 : 0,
				fill: contextHighlight ? 0xffffff : contextColor,
				dropShadow: this.dropShadow,
				dropShadowBlur: this.dropShadowBlur,
			})
			const measureStyle = new PIXI.TextStyle(style)
			measureStyle.dropShadow = false

			const measure = PIXI.TextMetrics.measureText(text, measureStyle)
			if (contextPosition.x + measure.width >= this.maxWidth * SCALE_MODIFIER) {
				newLine()
			}

			const renderedText = new ScalingText(text, style)
			renderedText.position = contextPosition
			const renderedSegment = {
				text: renderedText,
				basePosition: contextPosition.clone(),
				lineIndex: linesRendered,
			}
			currentLine.push(renderedSegment)
			this.segments.push(renderedSegment)
			this.addChild(renderedText)

			contextPosition.x += measure.width
		}

		segments.forEach((segment) => {
			if (!contextConditionStatus && segment.type !== 'CLOSING_TAG') {
				return
			}

			switch (segment.type) {
				case SegmentType.TEXT:
					insertText(segment.data!)
					break

				case SegmentType.OPENING_TAG:
					const openingTag = this.parseTag(segment.data!)
					switch (openingTag.name) {
						case 'star':
							insertText('*')
							break
						case 'c':
						case 'color':
							contextColorStack.push(contextColor)
							contextColor = this.standardizeColor(openingTag.args)
							break
						case 'p':
						case 'para':
							newLine()
							contextPosition.y += this.lineHeight * 0.3
							break
						case 'i':
						case 'info':
							contextColorStack.push(contextColor)
							contextColor = 0x999999
							contextItalic = true
							break
						case 'if':
							contextConditionStack.push(contextConditionStatus)
							contextConditionStatus = !!this.variables[openingTag.args]
							break
						case 'ifn':
							contextConditionStack.push(contextConditionStatus)
							contextConditionStatus = !this.variables[openingTag.args]
							break
					}
					break

				case SegmentType.CLOSING_TAG:
					const closingTag = this.parseTag(segment.data!)
					if (!contextConditionStatus && closingTag.name !== 'if') {
						break
					}

					switch (closingTag.name) {
						case 'c':
						case 'color':
							contextColor = contextColorStack.pop()!
							break
						case 'i':
						case 'info':
							contextColor = contextColorStack.pop()!
							contextItalic = false
							break
						case 'if':
						case 'ifn':
							contextConditionStatus = contextConditionStack.pop()!
							break
					}
					break

				case SegmentType.ITALIC:
					contextItalic = !contextItalic
					break

				case SegmentType.HIGHLIGHT:
					contextHighlight = !contextHighlight
					break

				case SegmentType.WORD_SEPARATOR:
					contextPosition.x += 5 * SCALE_MODIFIER
					break

				case SegmentType.LINE_SEPARATOR:
					newLine()
					break
			}
		})
		newLine()

		this.segments.forEach((segment) => {
			if (this.__verticalAlign === RichTextAlign.END) {
				segment.basePosition.y -= contextPosition.y
			} else if (this.__verticalAlign === RichTextAlign.CENTER) {
				segment.basePosition.y -= contextPosition.y / 2
			}
		})

		this.setFont(oldFontSize, oldLineHeight)
		this.__textLineCount = linesRendered

		if (this.background) {
			this.background.onTextRendered(
				new PIXI.Point(this.position.x, this.position.y),
				new PIXI.Point(this.maxWidth, contextPosition.y * (this.baseFontSize / 18))
			)
		}
	}

	getStateTransition(
		stateTransitions: Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction>,
		trigger: ParsingStateTransitionTrigger
	): ParsingStateTransitionAction | null {
		const keys = stateTransitions.keys()
		let key = keys.next()
		while (!key.done) {
			const recordedTrigger = key.value
			if (recordedTrigger.state === trigger.state && recordedTrigger.token === trigger.token) {
				return stateTransitions.get(recordedTrigger)
			}
			key = keys.next()
		}
		return null
	}

	parseTag(tag: string): { name: string; args: string } {
		if (tag.includes('=')) {
			return { name: tag.split('=')[0], args: tag.split('=')[1] }
		} else if (tag.includes(' ')) {
			return { name: tag.split(' ')[0], args: tag.split(' ')[1] }
		}
		return { name: tag, args: '' }
	}

	standardizeColor(color: string): number {
		const ctx = document.createElement('canvas').getContext('2d')!
		ctx.fillStyle = color
		return parseInt(ctx.fillStyle.substr(1), 16)
	}
}
