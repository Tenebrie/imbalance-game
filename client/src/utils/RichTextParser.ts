import RichTextVariables from '@shared/models/RichTextVariables'

import { insertRichTextVariables } from './Utils'

export enum SegmentType {
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

type Segment = {
	type: SegmentType
	basePosition: { x: number; y: number }
	data?: string
}

export type ParsedRichText = {
	segments: Segment[]
	humanReadableText: string
}

export const parseRichText = (text: string, variables: RichTextVariables): ParsedRichText => {
	const replacedText = insertRichTextVariables(text, variables)
	const chars = Array.from(replacedText)

	const segments: Segment[] = []

	let currentText = ''
	let currentData = ''
	let currentState = SegmentType.TEXT

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
		const action = getStateTransition(stateTransitions, trigger)
		if (!action) {
			currentData += char
			continue
		}

		if (action.insertedSegment && currentData) {
			segments.push({ type: action.insertedSegment, data: currentData, basePosition: { x: 0, y: 0 } })
		}
		if (action.postSegment) {
			segments.push({ type: action.postSegment, basePosition: { x: 0, y: 0 } })
		}
		currentState = action.state
		currentData = ''
	}
	segments.push({ type: currentState, data: currentData || '', basePosition: { x: 0, y: 0 } })

	let contextConditionStatus = true
	const contextConditionStack: boolean[] = []

	segments.forEach((segment) => {
		if (!contextConditionStatus && segment.type !== 'CLOSING_TAG') {
			return
		}

		switch (segment.type) {
			case SegmentType.TEXT:
				currentText += segment.data!
				break

			case SegmentType.OPENING_TAG:
				const openingTag = parseTag(segment.data!)
				switch (openingTag.name) {
					case 'star':
						currentText += segment.data!
						break
					case 'p':
					case 'para':
						currentText += '\n'
						break
					case 'if':
						contextConditionStack.push(contextConditionStatus)
						contextConditionStatus = !!variables[openingTag.args]
						break
					case 'ifn':
						contextConditionStack.push(contextConditionStatus)
						contextConditionStatus = !variables[openingTag.args]
						break
				}
				break

			case SegmentType.CLOSING_TAG:
				const closingTag = parseTag(segment.data!)
				if (!contextConditionStatus && closingTag.name !== 'if') {
					break
				}

				switch (closingTag.name) {
					case 'if':
					case 'ifn':
						contextConditionStatus = contextConditionStack.pop()!
						break
				}
				break

			case SegmentType.WORD_SEPARATOR:
				currentText += ' '
				break

			case SegmentType.LINE_SEPARATOR:
				currentText += '\n'
				break
		}
	})

	return {
		segments,
		humanReadableText: currentText,
	}
}

const getStateTransition = (
	stateTransitions: Map<ParsingStateTransitionTrigger, ParsingStateTransitionAction>,
	trigger: ParsingStateTransitionTrigger
): ParsingStateTransitionAction | null => {
	const keys = stateTransitions.keys()
	let key = keys.next()
	while (!key.done) {
		const recordedTrigger = key.value
		if (recordedTrigger.state === trigger.state && recordedTrigger.token === trigger.token) {
			return stateTransitions.get(recordedTrigger) || null
		}
		key = keys.next()
	}
	return null
}

const parseTag = (tag: string): { name: string; args: string } => {
	if (tag.includes('=')) {
		return { name: tag.split('=')[0], args: tag.split('=')[1] }
	} else if (tag.includes(' ')) {
		return { name: tag.split(' ')[0], args: tag.split(' ')[1] }
	}
	return { name: tag, args: '' }
}
