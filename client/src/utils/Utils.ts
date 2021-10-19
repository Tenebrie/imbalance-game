import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import Buff from '@shared/models/Buff'
import Card from '@shared/models/Card'
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import RichTextVariables from '@shared/models/RichTextVariables'
import { getMaxCardCopiesForColor, getMaxCardCountForColor } from '@shared/Utils'
import * as PIXI from 'pixi.js'
import * as Particles from 'pixi-particles'

import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import { LEFT_MOUSE_BUTTON, MIDDLE_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON } from '@/Pixi/input/Input'
import Localization from '@/Pixi/Localization'
import store from '@/Vue/store'

export const mergeCardTribes = (baseTribes: CardTribe[], buffs: (Buff | BuffMessage)[]): CardTribe[] => {
	let tribes = baseTribes.slice()
	buffs.forEach((buff) => {
		tribes = tribes.concat(buff.cardTribes.slice())
	})
	return [...new Set(tribes)]
}

export const mergeCardFeatures = (baseFeatures: CardFeature[], buffs: (Buff | BuffMessage)[]): CardFeature[] => {
	let features = baseFeatures.slice()
	buffs.forEach((buff) => {
		features = features.concat(buff.cardFeatures.slice())
	})
	return [...new Set(features)]
}

export const normalizeBoardRowIndex = (index: number, player: 'player' | 'opponent'): number => {
	return Core.board.isInverted && player === 'player' ? Core.constants.GAME_BOARD_ROW_COUNT - index - 1 : index
}

export const snakeToCamelCase = (str: string): string =>
	str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

export const insertRichTextVariables = (str: string | null | undefined, variables: RichTextVariables): string => {
	if (str === null || str === undefined) {
		return ''
	}

	let replacedText = str
	for (const variableName in variables) {
		const variableValue = variables[variableName] === undefined ? '' : variables[variableName]
		const regexp = new RegExp('{' + variableName + '}', 'g')
		replacedText = replacedText.replace(regexp, '*' + variableValue.toString() + '*')
	}
	return replacedText
}

export const isElectron = (): boolean => {
	// @ts-ignore
	if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process['type'] === 'renderer') {
		return true
	}

	// Main process
	// @ts-ignore
	if (typeof process !== 'undefined' && typeof process['versions'] === 'object' && !!process['versions'].electron) {
		return true
	}

	// Detect the user agent when the `nodeIntegration` option is set to true
	if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
		return true
	}
	return false
}

export const rarityToColor = (rarity: CardColor): number => {
	switch (rarity) {
		case CardColor.LEADER:
			return 0x66cdaa
		case CardColor.GOLDEN:
			return 0xff8c00
		case CardColor.SILVER:
			return 0xbb20bb
		case CardColor.BRONZE:
			return 0xffffff
		case CardColor.TOKEN:
			return 0xbbbbbb
	}
}

export const arrayShallowMatch = (a: any[], b: any[]): boolean => {
	return a.every((el) => b.includes(el)) && b.every((el) => a.includes(el))
}

type AnyPoint = {
	x: number
	y: number
}

export const getDistance = (a: AnyPoint, b: AnyPoint): number => {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export const getAnimDurationMod = (): number => {
	let value = 1
	if (store.state.userPreferencesModule.fastMode) {
		value = value / 2
	}
	if (store.state.hotkeysModule.fastAnimation) {
		value = value / 2
	} else if (store.state.hotkeysModule.ultraFastAnimation) {
		value = value / 4
	}
	return value
}

export const getEntityName = (id: string, players: GameHistoryPlayerDatabaseEntry[], mode: 'game' | 'admin'): string => {
	if (id.startsWith('player:') && players.find((player) => player.id === id)) {
		return `${players.find((player) => player.id === id)?.username}`
	} else if (id.startsWith('player:')) {
		return `Player#${id.substr(7, 8)}`
	} else if (id.startsWith('group:') && players.find((player) => player.groupId === id)) {
		const playersInGroup = players
			.filter((player) => player.groupId === id)
			.map((player) => player.username)
			.join(', ')
		return `[${playersInGroup}]`
	} else if (id.startsWith('group:')) {
		return `AI Player [${id.substr(6, 4)}]`
	} else if (id.startsWith('ai:')) {
		return `AI Player [${id.substr(3, 4)}]`
	} else if (id.startsWith('card:') && mode === 'admin') {
		return `${Localization.get(`card.${id.split(':')[1]}.name`)} [${id.split(':')[2].substr(0, 8)}]`
	} else if (id.startsWith('buff:') && mode === 'admin') {
		return `${Localization.get(`buff.${id.split(':')[1]}.name`)} [${id.split(':')[2].substr(0, 8)}]`
	} else if (id.startsWith('card:') && mode === 'game') {
		const card = Core.game.findCardById(id)
		if (card) {
			return `${Localization.getCardName(card)}`
		}
		const cardInLibrary = store.state.editor.cardLibrary.find((card) => card.id === id)
		if (cardInLibrary) {
			return `${Localization.getCardName(cardInLibrary)}`
		}
		return id
	} else if (id.startsWith('buff:') && mode === 'game') {
		const buff = Core.game.findBuffById(id)
		if (buff) {
			return `${Localization.get(buff.name)}`
		}
		return id
	}
	return id
}

const boopColors = [
	{
		start: '55FFFF',
		end: '00FFFF',
	},
	{
		start: 'FFAAFF',
		end: 'FF00FF',
	},
	{
		start: 'FF5555',
		end: 'FF0000',
	},
	{
		start: 'AAFFAA',
		end: '00FF00',
	},
]
let currentBoopColor = Math.floor(Math.random() * boopColors.length)
let boopPrepPoints: { emitter: Particles.Emitter; color: { start: string; end: string } }[] = []
export const boopTheBoard = (event: MouseEvent, startingPos: PIXI.Point | null, direction: 'down' | 'up'): void => {
	const mousePos = Core.input.mousePosition
	if (event.button === LEFT_MOUSE_BUTTON) {
		Core.particleSystem.createBoardBoopEffect(mousePos, event, 0, 0.75)
	} else if (event.button === RIGHT_MOUSE_BUTTON && direction === 'down') {
		boopPrepPoints.push({
			emitter: Core.particleSystem.createBoardBoopPrepareEffect(mousePos),
			color: getBoopColor(),
		})
		Core.particleSystem.createBoardBoopEffect(mousePos, event, 0, 1)
	} else if (event.button === RIGHT_MOUSE_BUTTON && direction === 'up') {
		const shortPreps = boopPrepPoints.filter((prep) => getDistance(mousePos, prep.emitter.spawnPos) < 10)
		shortPreps.forEach((prep) => {
			Core.particleSystem.destroyEmitter(prep.emitter, Core.renderer.boardEffectsContainer)
		})
		boopPrepPoints
			.filter((prep) => !shortPreps.includes(prep))
			.forEach((prep) => {
				Core.mainHandler.projectileSystem.createBoardBoopProjectile(prep.emitter.spawnPos, mousePos, event, prep.color)
				Core.particleSystem.destroyEmitter(prep.emitter, Core.renderer.boardEffectsContainer)
			})
		boopPrepPoints = []
	} else if (event.button === MIDDLE_MOUSE_BUTTON && direction === 'down') {
		if (boopPrepPoints.length > 0 && boopPrepPoints.length < 16) {
			Core.particleSystem.createBoardBoopEffect(mousePos, event, 0, 0.75)
			boopPrepPoints.push({
				emitter: Core.particleSystem.createBoardBoopPrepareEffect(mousePos),
				color: getBoopColor(),
			})
		} else {
			const randomColor = boopColors[Math.floor(Math.random() * boopColors.length)]
			Core.particleSystem.createBoardBoopEffect(mousePos, event, 0, 0.75, randomColor)
			const vector = legacyExport.getPointWithOffset(mousePos, Math.random() * 360, 300 + Math.random() * 400)
			Core.mainHandler.projectileSystem.createBoardBoopFireworkProjectile(mousePos, vector, event, randomColor)
		}
	}
}
export const scrollBoopColor = (event: MouseEvent, direction: number): void => {
	currentBoopColor += direction
	if (currentBoopColor < 0) {
		currentBoopColor += boopColors.length
	} else if (currentBoopColor >= boopColors.length) {
		currentBoopColor -= boopColors.length
	}
	const mousePos = Core.input.mousePosition
	Core.particleSystem.createBoardBoopEffect(mousePos, event, 0, 0.75)
}

export const flushBoardBoopPreps = (): void => {
	boopPrepPoints.forEach((prep) => {
		Core.particleSystem.destroyEmitter(prep.emitter, Core.renderer.boardEffectsContainer)
	})
	boopPrepPoints = []
}

export const getBoopColor = (): { start: string; end: string } => {
	return boopColors[currentBoopColor]
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
		// @ts-ignore
	})(navigator.userAgent || navigator.vendor || window['opera'])
	return check
}

export const electronHost = (): string => {
	return 'http://localhost:3000'
}

export const electronWebsocketTarget = (): string => {
	return 'localhost:3000'
}

export const getCardInsertIndex = (hoveredRow: RenderedGameBoardRow | null): number => {
	if (!hoveredRow) {
		return -1
	}
	const hoveredUnit = Core.input.hoveredCard
	if (!hoveredUnit || !hoveredRow.includesCard(hoveredUnit.card)) {
		return Core.input.mousePosition.x > hoveredRow.container.position.x ? hoveredRow.cards.length : 0
	}
	let index = hoveredRow.getCardIndex(hoveredUnit.card)
	if (Core.input.mousePosition.x > hoveredUnit.card.hitboxSprite.position.x) {
		index += 1
	}
	return index
}

const legacyExport = {
	getFont(text: string): string {
		let font = 'Roboto'
		const cyrillic = /[а-яА-Я]/g.exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return font
	},

	getVectorAngleAsDegrees(point: AnyPoint): number {
		const angle = Math.atan2(point.y, point.x)
		const degrees = (180 * angle) / Math.PI
		return 360 + Math.round(degrees)
	},

	getVectorAngleAsRadians(point: AnyPoint): number {
		return Math.atan2(point.y, point.x)
	},

	getPointWithOffset(point: AnyPoint, angle: number, distance: number): PIXI.Point {
		const offsetPoint = new PIXI.Point()
		offsetPoint.x = point.x + Math.cos(angle) * distance
		offsetPoint.y = point.y + Math.sin(angle) * distance
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

	canAddCardToDeck(deckId: string, cardToAdd: Card | CardMessage): boolean {
		const cardOfColorCount = store.getters.editor.cardsOfColor({ deckId: deckId, color: cardToAdd.color })
		if (cardOfColorCount >= getMaxCardCountForColor(cardToAdd.color)) {
			return false
		}

		const deckToModify = store.getters.editor.deck(deckId)
		if (!deckToModify) {
			return false
		}

		if (
			cardToAdd.faction !== CardFaction.NEUTRAL &&
			cardToAdd.faction !== deckToModify.faction &&
			deckToModify.faction !== CardFaction.NEUTRAL
		) {
			return false
		}

		const maxCount = getMaxCardCopiesForColor(cardToAdd.color)
		const cardToModify = deckToModify.cards.find((card) => card.class === cardToAdd.class)
		return !cardToModify || cardToModify.count < maxCount
	},
}

export default legacyExport
