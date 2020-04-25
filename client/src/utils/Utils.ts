import * as PIXI from 'pixi.js'
import CardMessage from '@shared/models/network/CardMessage'
import RenderedCard from '@/Pixi/board/RenderedCard'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import {CardDisplayMode} from '@/Pixi/enums/CardDisplayMode'

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
		return inputArray.slice().sort((a: Card, b: Card) => {
			return (a.type - b.type) ||
				(a.type === CardType.UNIT && (a.color - b.color || b.power - a.power || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id))) ||
				(a.type === CardType.SPELL && (a.color - b.color || a.power - b.power || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id)))
		})
	}
}
