import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Card from '@shared/models/Card'
import CardColor from '@shared/enums/CardColor'
import Constants from '@shared/Constants'
import store from '@/Vue/store'
import RichTextVariables from '@shared/models/RichTextVariables'
import CardMessage from '@shared/models/network/card/CardMessage'
import { sortCards } from '@shared/Utils'

export const forEachInNumericEnum = (enumeration: { [s: number]: number }, handler: (val: number) => any): void => {
	for (const value in enumeration) {
		if (!isNaN(Number(value))) {
			handler(Number(value))
		}
	}
}

export const forEachInStringEnum = (enumeration: { [s: number]: string }, handler: (val: string) => any): void => {
	for (const value in enumeration) {
		handler(enumeration[value])
	}
}

export const snakeToCamelCase = (str: string): string =>
	str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

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

export const isElectron = (): boolean => {
	if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process['type'] === 'renderer') {
		return true
	}

	// Main process
	if (typeof process !== 'undefined' && typeof process['versions'] === 'object' && !!process['versions'].electron) {
		return true
	}

	// Detect the user agent when the `nodeIntegration` option is set to true
	if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
		return true
	}
}

export const isMobile = (): boolean => {
	let check = false
	;(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
				a.substr(0, 4)
			)
		)
			check = true
	})(navigator.userAgent || navigator.vendor || window['opera'])
	return check
}

export const electronHost = (): string => {
	return 'http://localhost:3000'
}

export const electronWebsocketTarget = (): string => {
	return 'localhost:3000'
}

export default {
	getFont(text: string): string {
		let font = 'Roboto'
		const cyrillic = /[а-яА-Я]/g.exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return font
	},

	getVectorAngleAsDegrees(point: PIXI.Point): number {
		const angle = Math.atan2(point.y, point.x)
		const degrees = (180 * angle) / Math.PI
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
			hash = (hash << 5) - hash + chr
			hash |= 0 // Convert to 32bit integer
		}
		return hash
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
		const cardToModify = deckToModify.cards.find((card) => card.class === cardToAdd.class)
		return !cardToModify || cardToModify.count < maxCount
	},
}
