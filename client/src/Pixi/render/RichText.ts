import * as PIXI from 'pixi.js'

enum SegmentType {
	TEXT,
	TAG,
	HIGHLIGHT
}

class Segment {
	type: SegmentType
	data: string

	constructor(type: SegmentType, data: string) {
		this.type = type
		this.data = data
	}
}

export default class RichText extends PIXI.Container {
	segments: PIXI.Text[]

	constructor(text: string) {
		super()
		this.segments = []
		this.renderText(text)
	}

	renderText(text: string) {
		const chars = Array.from(text)

		const segments: Segment[] = []

		let currentSegment = SegmentType.TEXT
		let currentData = ''

		const flushSegment = () => {
			segments.push(new Segment(currentSegment, currentData))
			currentData = ''
		}

		const stateTransitions = {

		}

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i]
			if (char === '<' && currentSegment === SegmentType.TEXT) {
				flushSegment()
				currentSegment = SegmentType.TAG
			} else if (char === '>' && currentSegment === SegmentType.TAG) {
				flushSegment()
				currentSegment = SegmentType.TEXT
			} else if (char === '*' && currentSegment === SegmentType.TEXT) {
				flushSegment()
				currentSegment = SegmentType.HIGHLIGHT
			} else if (char === '*' && currentSegment === SegmentType.TEXT) {
				flushSegment()
				currentSegment = SegmentType.HIGHLIGHT
			} else {
				currentData += char
			}
		}
	}

	getFont(size: number, text: string) {
		let font = 'K2D'
		let cyrillic = (/[а-яА-Я]/g).exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return size + ' ' + font
	}

	stripMarkup(text: string) {
		const htmlTagPattern = /<[^>]*>/g
		return text.replace(htmlTagPattern, '').replace(/\*/g, '')
	}
}
