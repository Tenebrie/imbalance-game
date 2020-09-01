import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerCard from '../game/models/ServerCard'
import AsciiColor from '../enums/AsciiColor'
import ServerUnit from '../game/models/ServerUnit'
import {CardConstructor} from '../game/libraries/CardLibrary'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'

interface TryUntilArgs {
	try: () => void | Promise<void>
	until: () => boolean | Promise<boolean>
	maxAttempts: number
}

export const tryUntil = (args: TryUntilArgs): boolean => {
	for (let i = 0; i < args.maxAttempts; i++) {
		args.try()
		if (args.until) {
			return true
		}
	}
	return false
}

const shortIdCharset = 'abcdefghkmnopqrstuvwxyzABCDEFGHKMNPQRSTUVWXYZ0123456789'
export const generateShortId = (length: number): string => {
	let id = ''
	for (let i = 0; i < length; i++) {
		const charIndex = Math.floor(Math.random() * shortIdCharset.length)
		id += shortIdCharset.charAt(charIndex)
	}
	return id
}

export const isCardPublic = (card: ServerCard): boolean => {
	const location = card.location
	const isHeroPower = card.features.includes(CardFeature.HERO_POWER)
	return (location !== CardLocation.HAND && location !== CardLocation.DECK) || (location === CardLocation.HAND && isHeroPower)
}

export const colorize = (text: string | number, color: AsciiColor): string => {
	return `${color}${text}\u001b[0m`
}

export const colorizeId = (text: string): string => {
	return colorize(text, AsciiColor.CYAN)
}

export const colorizePlayer = (text: string): string => {
	return colorize(text, AsciiColor.RED)
}

export const colorizeConsoleText = (text: string): string => {
	return colorize(text, AsciiColor.MAGENTA)
}

export const mapUnitsToCards = (units: ServerUnit[]): ServerCard[] => {
	return units.map(unit => unit.card)
}

export const mapRelatedCards = (constructors: CardConstructor[]): string[] => {
	return constructors.map(constructor => getClassFromConstructor(constructor))
}

export const mapTribeCards = (constructors: CardConstructor[]): string[] => {
	return constructors.map(constructor => constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1))
}

export const getClassFromConstructor = (constructor: CardConstructor): string => {
	return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
}

export default {
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

	flat(array: any[], depth = 1): any[] {
		return array.reduce((flat, toFlatten) => {
			return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? flat(toFlatten, depth - 1) : toFlatten)
		}, [])
	},

	forEachInNumericEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			if (!isNaN(Number(value))) {
				handler(Number(value))
			}
		}
	},

	forEachInStringEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			handler(enumeration[value])
		}
	},

	shuffle(inputArray: any[]) {
		const array = inputArray.slice()
		let currentIndex = array.length

		while (currentIndex > 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex -= 1
			const temporaryValue = array[currentIndex]
			array[currentIndex] = array[randomIndex]
			array[randomIndex] = temporaryValue
		}

		return array
	},

	sortCards(inputArray: ServerCard[]): ServerCard[] {
		return inputArray.slice().sort((a: Card, b: Card) => {
			return (
				(a.type - b.type) ||
				(a.type === CardType.UNIT && (a.color - b.color || b.stats.power - a.stats.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id))) ||
				(a.type === CardType.SPELL && (a.color - b.color || a.stats.power - b.stats.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id)))
			)
		})
	},
}
