import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerCard from '../game/models/ServerCard'
import AsciiColor from '../enums/AsciiColor'
import ServerUnit from '../game/models/ServerUnit'
import {CardConstructor} from '../game/libraries/CardLibrary'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ServerPlayer from '../game/players/ServerPlayer'
import {Request} from 'express'
import {sortCards} from '@shared/Utils'

interface TryUntilArgs {
	try: () => void | Promise<void>
	until: () => boolean | Promise<boolean>
	maxAttempts: number
}

export const tryUntil = (args: TryUntilArgs): boolean => {
	for (let i = 0; i < args.maxAttempts; i++) {
		args.try()
		if (args.until()) {
			return true
		}
	}
	return false
}

export const getPlayerFromAuthenticatedRequest = (req: Request): ServerPlayer => {
	// @ts-ignore
	return req['player'] as unknown as ServerPlayer
}

export const invalidEmailCharacters = /[^a-zA-Zа-яА-Я0-9\-_.@+]/g
export const invalidUsernameCharacters = /[^a-zA-Zа-яА-Я0-9\-_.]/g

export const registerFormValidators = {
	email: (email: string): boolean => {
		return email.length > 0 && !invalidEmailCharacters.exec(email)
	},
	username: (username: string): boolean => {
		return username.length > 0 && !invalidUsernameCharacters.exec(username)
	},
	password: (password: string): boolean => {
		return password.length > 0
	},
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
	const isHeroPower = card.features.includes(CardFeature.HERO_POWER) || card.features.includes(CardFeature.HERO_ARTIFACT)
	return (location !== CardLocation.HAND && location !== CardLocation.DECK) || (location === CardLocation.HAND && (isHeroPower || card.isRevealed))
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

export const limitValueToInterval = (min: number, value: number, max: number): number => {
	return Math.max(min, Math.min(value, max))
}

export default {
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

	shuffle(inputArray: any[]): any[] {
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
		return sortCards(inputArray) as ServerCard[]
	},
}
