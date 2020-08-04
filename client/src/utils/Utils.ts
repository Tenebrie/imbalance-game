import * as PIXI from 'pixi.js'
import CardMessage from '@shared/models/network/CardMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardType from '@shared/enums/CardType'
import CardFeature from '@shared/enums/CardFeature'
import Card from '@shared/models/Card'
import CardColor from '@shared/enums/CardColor'
import Constants from '@shared/Constants'
import store from '@/Vue/store'
import RenderQuality from '@shared/enums/RenderQuality'

export interface CardRenderScale {
	superSamplingLevel: number
	generalGameFontRenderScale: number
	generalEditorFontRenderScale: number
	descriptionGameFontRenderScale: number
	descriptionEditorFontRenderScale: number
}

export const getRenderScale = (): CardRenderScale => {
	const selectedQuality = store.state.userPreferencesModule.renderQuality
	if (selectedQuality === RenderQuality.ULTRA) {
		return {
			superSamplingLevel: 2.0,
			generalGameFontRenderScale: 1.2,
			generalEditorFontRenderScale: 1.5,
			descriptionGameFontRenderScale: 1.2,
			descriptionEditorFontRenderScale: 1.2
		}
	} else if (selectedQuality === RenderQuality.HIGH || selectedQuality === RenderQuality.DEFAULT) {
		return {
			superSamplingLevel: 1.0,
			generalGameFontRenderScale: 1.4,
			generalEditorFontRenderScale: 1.5,
			descriptionGameFontRenderScale: 1.5,
			descriptionEditorFontRenderScale: 1.2
		}
	} else if (selectedQuality === RenderQuality.NORMAL) {
		return {
			superSamplingLevel: 1.0,
			generalGameFontRenderScale: 1.0,
			generalEditorFontRenderScale: 1.0,
			descriptionGameFontRenderScale: 1.0,
			descriptionEditorFontRenderScale: 1.0
		}
	}
}

export const forEachInNumericEnum = (enumeration: any, handler: (val: any) => any): void => {
	for (const value in enumeration) {
		if (!isNaN(Number(value))) {
			handler(Number(value))
		}
	}
}

export const forEachInStringEnum = (enumeration: any, handler: (val: any) => any): void => {
	for (const value in enumeration) {
		handler(enumeration[value])
	}
}

export default {
	getFont(text: string) {
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
		return inputArray.slice().sort((a: RenderedCard, b: RenderedCard) => {
			return (
				(+a.features.includes(CardFeature.LOW_SORT_PRIORITY) - +b.features.includes(CardFeature.LOW_SORT_PRIORITY)) ||
				(a.type - b.type) ||
				(a.type === CardType.UNIT && (a.color - b.color || b.power - a.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id))) ||
				(a.type === CardType.SPELL && (a.color - b.color || a.power - b.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id)))
			)
		})
	},

	sortEditorCards(inputArray: CardMessage[]): any[] {
		return inputArray.slice().sort((a: CardMessage, b: CardMessage) => {
			return (
				(a.type - b.type) ||
				(a.type === CardType.UNIT && (a.color - b.color || b.power - a.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id))) ||
				(a.type === CardType.SPELL && (a.color - b.color || a.power - b.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id)))
			)
		})
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

	canAddCardToDeck(deckId: string, cardToAdd: Card | CardMessage): boolean {
		const cardOfColorCount = store.getters.editor.cardsOfColor({ deckId: deckId, color: cardToAdd.color })
		if (cardOfColorCount >= this.getMaxCardCountForColor(cardToAdd.color)) {
			return false
		}

		const deckToModify = store.getters.editor.deck(deckId)
		if (!deckToModify) {
			return false
		}

		const maxCount = cardToAdd.color === CardColor.BRONZE ? 3 : 1
		const cardToModify = deckToModify.cards.find(card => card.class === cardToAdd.class)
		return !cardToModify || cardToModify.count < maxCount
	}
}
