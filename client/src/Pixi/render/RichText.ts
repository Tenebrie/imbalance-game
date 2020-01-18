import * as PIXI from 'pixi.js'
import Utils from '@/utils/Utils'
import RenderedCard from '@/Pixi/models/RenderedCard'
import Localization from '@/Pixi/Localization'

enum SegmentType {
	TEXT = 'TEXT',
	HIGHLIGHT = 'HIGHLIGHT',
	OPENING_TAG = 'OPENING_TAG',
	CLOSING_TAG = 'CLOSING_TAG',
	WORD_SEPARATOR = 'WORD_SEPARATOR',
	LINE_SEPARATOR = 'LINE_SEPARATOR'
}

type ParsingStateTransitionTrigger = {
	state: SegmentType
	token: string
}

type ParsingStateTransitionAction = {
	state: SegmentType
	insertedSegment?: SegmentType
	postSegment?: SegmentType
}

type Segment = {
	type: SegmentType
	data?: string
}

export default class RichText extends PIXI.Container {
	card: RenderedCard
	source: string
	fontSize: number
	baseFontSize: number
	lineHeight: number
	maxWidth: number
	segments: PIXI.Text[]

	constructor(card: RenderedCard, text: string, maxWidth: number) {
		super()
		this.card = card
		this.source = text
		this.fontSize = 18
		this.baseFontSize = 18
		this.lineHeight = 24
		this.maxWidth = maxWidth
		this.segments = []
		this.renderText()
	}

	get text() {
		return this.source
	}

	get style() {
		const parent = this
		return {
			get fontSize() {
				return parent.fontSize
			},
			set fontSize(value: number) {
				if (value === parent.fontSize) {
					return
				}
				parent.fontSize = value
				parent.renderText()
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
			}
		}
	}

	renderText() {
		while (this.children.length > 0) {
			this.removeChildAt(0)
		}

		const SCALE_MODIFIER = this.fontSize / this.baseFontSize

		const replacedText = (this.text || '').replace('{name}', `${Localization.getString(this.card.cardName)}`)
		const chars = Array.from(replacedText)

		const segments: Segment[] = []

		let currentState = SegmentType.TEXT
		let currentData = ''

		const stateSegmentType: Map<SegmentType, SegmentType> = new Map<SegmentType, SegmentType>()
		stateSegmentType.set(SegmentType.TEXT, SegmentType.TEXT)
		stateSegmentType.set(SegmentType.HIGHLIGHT, SegmentType.HIGHLIGHT)

		const stateTransitions: Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction> = new Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction>()

		stateTransitions.set({ state: SegmentType.TEXT, token: ' ' }, { state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.WORD_SEPARATOR })
		stateTransitions.set({ state: SegmentType.TEXT, token: '\n' }, { state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.LINE_SEPARATOR })
		stateTransitions.set({ state: SegmentType.TEXT, token: '*' }, { state: SegmentType.TEXT, insertedSegment: SegmentType.TEXT, postSegment: SegmentType.HIGHLIGHT })
		stateTransitions.set({ state: SegmentType.TEXT, token: '<' }, { state: SegmentType.OPENING_TAG, insertedSegment: SegmentType.TEXT })
		stateTransitions.set({ state: SegmentType.OPENING_TAG, token: '/' }, { state: SegmentType.CLOSING_TAG })
		stateTransitions.set({ state: SegmentType.OPENING_TAG, token: '>' }, { state: SegmentType.TEXT, insertedSegment: SegmentType.OPENING_TAG })
		stateTransitions.set({ state: SegmentType.CLOSING_TAG, token: '>' }, { state: SegmentType.TEXT, insertedSegment: SegmentType.CLOSING_TAG })

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

		let contextPosition = new PIXI.Point(0, 0)
		let contextHighlight = false
		let contextColor = 0xCCCCCC
		let contextColorStack: number[] = []
		let currentLine: PIXI.Text[] = []

		const newLine = () => {
			currentLine.forEach(segment => {
				segment.position.x -= contextPosition.x / 2
			})

			contextPosition.x = 0
			contextPosition.y += this.lineHeight
			currentLine = []
		}

		segments.forEach(segment => {
			switch (segment.type) {
				case SegmentType.TEXT:
					const text = segment.data!
					const style = new PIXI.TextStyle({
						fontFamily: Utils.getFont(text),
						fontSize: this.fontSize,
						fill: contextHighlight ? 0xFFFFFF : contextColor
					})
					const measure = PIXI.TextMetrics.measureText(text, style)
					if (contextPosition.x + measure.width >= this.maxWidth * SCALE_MODIFIER) {
						newLine()
					}

					const renderedText = new PIXI.Text(segment.data!, style)
					renderedText.position = contextPosition
					currentLine.push(renderedText)
					this.addChild(renderedText)

					contextPosition.x += measure.width
					break

				case SegmentType.OPENING_TAG:
					const openingTag = this.parseTag(segment.data!)
					switch (openingTag.name) {
						case 'c':
						case 'color':
							contextColorStack.push(contextColor)
							contextColor = this.standardizeColor(openingTag.args)
							break
					}
					break

				case SegmentType.CLOSING_TAG:
					const closingTag = this.parseTag(segment.data!)
					switch (closingTag.name) {
						case 'c':
						case 'color':
							contextColor = contextColorStack.pop()!
							break
					}
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

		this.children.forEach(renderedText => {
			renderedText.position.y -= contextPosition.y / 2
		})
	}

	getStateTransition(stateTransitions: Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction>, trigger: ParsingStateTransitionTrigger) {
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

	parseTag(tag: string): { name: string, args: string } {
		if (tag.includes('=')) {
			return { name: tag.split('=')[0], args: tag.split('=')[1] }
		}
		return { name: tag, args: '' }
	}

	standardizeColor(color: string) {
		const ctx = document.createElement('canvas').getContext('2d')!
		ctx.fillStyle = color
		return parseInt(ctx.fillStyle.substr(1), 16)
	}
}
