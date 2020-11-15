import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardType from '@shared/enums/CardType'
import CardFeature from '@shared/enums/CardFeature'
import Card from '@shared/models/Card'
import CardColor from '@shared/enums/CardColor'
import Constants from '@shared/Constants'
import store from '@/Vue/store'
import RichTextVariables from '@shared/models/RichTextVariables'
import CardMessage from '@shared/models/network/card/CardMessage'
import {sortCards} from '@shared/Utils'

export const forEachInNumericEnum = (enumeration: any, handler: (val: number) => any): void => {
	for (const value in enumeration) {
		if (!isNaN(Number(value))) {
			handler(Number(value))
		}
	}
}

export const forEachInStringEnum = (enumeration: any, handler: (val: string) => any): void => {
	for (const value in enumeration) {
		handler(enumeration[value])
	}
}

export const snakeToCamelCase = (str: string): string => str.toLowerCase().replace(
	/([-_][a-z])/g,
	(group) => group.toUpperCase()
		.replace('-', '')
		.replace('_', '')
)

export const insertRichTextVariables = (str: string | null | undefined, variables: RichTextVariables): string => {
	if (str === null || str === undefined) {
		return ''
	}

	let replacedText = str
	for (const variableName in variables) {
		const variableValue = variables[variableName] || ''
		const regexp = new RegExp('{' + variableName + '}', 'g')
		replacedText = replacedText.replace(regexp, '*' + variableValue.toString() + '*')
	}
	return replacedText
}

export default {
	getFont(text: string): string {
		let font = 'Roboto'
		const cyrillic = (/[а-яА-Я]/g).exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return font
	},

	getVectorAngleAsDegrees(point: PIXI.Point): number {
		const angle = Math.atan2(point.y, point.x)
		const degrees = 180 * angle / Math.PI
		return 360 + Math.round(degrees)
	},

	getVectorAngleAsRadians(point: PIXI.Point): number {
		return Math.atan2(point.y, point.x)
	},

	getPointWithOffset(point: PIXI.Point, angle: number, distance: number): PIXI.Point {
		const offsetPoint = new PIXI.Point()
		offsetPoint.x = point.x + Math.cos(angle) * distance
		offsetPoint.y = point.y - Math.sin(angle) * distance
		return offsetPoint
	},

	hashCode(targetString: string): number {
		let i
		let chr
		let hash = 0
		if (targetString.length === 0) {
			return hash
		}
		for (i = 0; i < targetString.length; i++) {
			chr = targetString.charCodeAt(i)
			hash = ((hash << 5) - hash) + chr
			hash |= 0 // Convert to 32bit integer
		}
		return hash
	},

	async renderCardsAsynchronously(cardMessages: CardMessage[]): Promise<RenderedCard[]> {
		const promises = []
		let i = 0
		cardMessages.forEach(message => {
			promises.push(new Promise(resolve => {
				setTimeout(() => resolve(RenderedCard.fromMessage(message)), i)
			}))
			i += 5
		})
		return await Promise.all(promises)
	},

	splitArrayIntoChunks(inputArray: any[], chunkCount: number): any[] {
		const length = inputArray.length
		const chunks = []
		let itemsProcessed = 0
		for (let i = 0; i < chunkCount; i++) {
			let itemsPerChunk = Math.floor(length / chunkCount)
			if (length % chunkCount > i) {
				itemsPerChunk += 1
			}
			chunks.push(inputArray.slice(itemsProcessed, itemsProcessed + itemsPerChunk))
			itemsProcessed += itemsPerChunk
		}
		return chunks
	},

	splitArrayIntoFixedChunks(inputArray: any[], itemsPerChunk: number): any[] {
		const length = inputArray.length
		const chunks = []
		let itemsProcessed = 0
		while (itemsProcessed < length) {
			chunks.push(inputArray.slice(itemsProcessed, itemsProcessed + itemsPerChunk))
			itemsProcessed += itemsPerChunk
		}
		return chunks
	},

	sortCards(inputArray: RenderedCard[]): RenderedCard[] {
		return sortCards(inputArray) as RenderedCard[]
	},

	sortEditorCards(inputArray: CardMessage[]): any[] {
		return sortCards(inputArray) as CardMessage[]
	},

	getMaxCardCountForColor(color: CardColor): number {
		switch (color) {
			case CardColor.LEADER:
				return Constants.CARD_LIMIT_LEADER
			case CardColor.GOLDEN:
				return Constants.CARD_LIMIT_GOLDEN
			case CardColor.SILVER:
				return Constants.CARD_LIMIT_SILVER
			case CardColor.BRONZE:
				return Constants.CARD_LIMIT_BRONZE
			default:
				return 0
		}
	},

	getMaxCardCopiesForColor(color: CardColor): number {
		switch (color) {
			case CardColor.LEADER:
				return Constants.CARD_COPIES_LIMIT_LEADER
			case CardColor.GOLDEN:
				return Constants.CARD_COPIES_LIMIT_GOLDEN
			case CardColor.SILVER:
				return Constants.CARD_COPIES_LIMIT_SILVER
			case CardColor.BRONZE:
				return Constants.CARD_COPIES_LIMIT_BRONZE
			default:
				return 0
		}
	},

	canAddCardToDeck(deckId: string, cardToAdd: Card | CardMessage): boolean {
		const cardOfColorCount = store.getters.editor.cardsOfColor({ deckId: deckId, color: cardToAdd.color })
		if (cardOfColorCount >= this.getMaxCardCountForColor(cardToAdd.color)) {
			return false
		}

		const deckToModify = store.getters.editor.deck(deckId)
		if (!deckToModify) {
			return false
		}

		const maxCount = this.getMaxCardCopiesForColor(cardToAdd.color)
		const cardToModify = deckToModify.cards.find(card => card.class === cardToAdd.class)
		return !cardToModify || cardToModify.count < maxCount
	}
}
